import PouchDB from "pouchdb";
import { Message_Types } from "../scr/Logic";

export let Server_States = Object.freeze({
	Local: "Local",
	Remote: "Remote"
});

export class DB {
	constructor(iAddress, iVerbose) {
		this.Queue = [];
		this.DBs = {};
		this.Docs = {};
		this.Verbose = iVerbose;
		this.Current_Operation = {};
		this.State = Server_States.Local;
		this.Address = iAddress;
		this.Database = new PouchDB(iAddress);
		this.Index = 0;
	}

	Add_Operation = iOperation => {
		iOperation.Operation_Id = this.Index++;
		this.Queue.push(iOperation);
	};

	Check_DB = iEntity => {
		if (!this.DBs[iEntity]) {
			this.Log("Check_DB: Creating DB for entity " + iEntity);
			this.DBs[iEntity] = new PouchDB(this.Address + iEntity.toLowerCase());
		}
	};

	// Check_Doc = (iEntity, iEntity_Id) => {
	// 	if (!this.Docs[iEntity + iEntity_Id]) {
	// 		this.Log(
	// 			"First time loading of entity " + iEntity + " (" + iEntity_Id + ")"
	// 		);

	// 		this.Queue.push({
	// 			Get_Doc_Inner: {
	// 				Entity: iEntity,
	// 				Entity_Id: iEntity_Id
	// 			}
	// 		});
	// 	}
	// };

	Get_Doc = (iEntity, iEntity_Id, iOn_Success, iOn_Error) => {
		this.Add_Operation({
			Func: this.Get_Doc_Inner,
			Entity: iEntity,
			Entity_Id: iEntity_Id,
			On_Success: iOn_Success,
			On_Error: iOn_Error
		});

		this.Dispatch();
	};

	Get_Doc_Inner = () => {
		const Operation = this.Current_Operation;
		const { Entity, Entity_Id } = Operation;

		this.DBs[Entity].get(Entity_Id)
			.then(this.On_Get_Success)
			.catch(this.On_Get_Error);
	};

	// Get_UID = (iOn_Success, iOn_Error) => {
	// 	this.Database.get("_uuids")
	// 		.then(iOn_Success)
	// 		.catch(iOn_Error);
	// };

	New_Doc = (iEntity, iOn_Success, iOn_Error) => {
		this.Add_Operation({
			Func: this.New_Doc_Inner,
			Entity: iEntity,
			On_Success: iOn_Success,
			On_Error: iOn_Error
		});

		this.Dispatch();
	};

	New_Doc_Inner = () => {
		const Operation = this.Current_Operation;
		const { Entity } = Operation;

		this.DBs[Entity].post({})
			.then(this.On_New_Success)
			.catch(this.On_New_Error);
	};

	Put_Doc = (iEntity, iEntity_Id, iField_Id, iData, iOn_Success, iOn_Error) => {
		this.Add_Operation({
			Func: this.Put_Doc_Inner,
			Entity: iEntity,
			Entity_Id: iEntity_Id,
			Field_Id: iField_Id,
			Data: iData,
			On_Success: iOn_Success,
			On_Error: iOn_Error
		});

		this.Dispatch();
	};

	Put_Doc_Inner = () => {
		const Operation = this.Current_Operation;
		const { Entity, Entity_Id, Field_Id, Data } = Operation;

		// this.Check_Doc(Entity, Entity_Id);

		this.Docs[Entity + Entity_Id][Field_Id] = Data;

		this.DBs[Entity].put(this.Docs[Entity + Entity_Id])
			.then(this.On_Put_Success)
			.catch(this.On_Put_Error);
	};

	Put_Atts = (iEntity, iEntity_Id, iFiles, iOn_Success, iOn_Error) => {
		const Current_Files = this.Docs[iEntity + iEntity_Id]._attachments
			? Object.keys(this.Docs[iEntity + iEntity_Id]._attachments)
			: [];

		const New_Files = Object.keys(iFiles);

		const Files_To_Remove = Current_Files.filter(C => !New_Files.includes(C));
		const Files_To_Add = New_Files.filter(N => !Current_Files.includes(N));

		Files_To_Add.forEach(File_Name => {
			const File_Object = iFiles[File_Name];

			this.Put_Att(
				iEntity,
				iEntity_Id,
				File_Name,
				File_Object.data,
				File_Object.content_type,
				iOn_Success,
				iOn_Error
			);
		});

		Files_To_Remove.forEach(File_Name => {
			this.Del_Att(iEntity, iEntity_Id, File_Name, iOn_Success, iOn_Error);
		});
	};

	Put_Att = (
		iEntity,
		iEntity_Id,
		iFileName,
		iFile,
		iContent_Type,
		iOn_Success,
		iOn_Error
	) => {
		this.Add_Operation({
			Func: this.Put_Att_Inner,
			Entity: iEntity,
			Entity_Id: iEntity_Id,
			File_Name: iFileName,
			File: iFile,
			Content_Type: iContent_Type,
			On_Success: iOn_Success,
			On_Error: iOn_Error
		});

		this.Dispatch();
	};

	Put_Att_Inner = () => {
		const {
			Entity,
			Entity_Id,
			File_Name,
			File,
			Content_Type
		} = this.Current_Operation;

		// this.Check_Doc(Entity, Entity_Id);

		this.DBs[Entity].putAttachment(
			Entity_Id,
			File_Name,
			this.Docs[Entity + Entity_Id]._rev,
			File,
			Content_Type
		)
			.then(this.On_Put_Success)
			.catch(this.On_Put_Error);
	};

	Del_Att = (iEntity, iEntity_Id, iFileName, iOn_Success, iOn_Error) => {
		this.Add_Operation({
			Func: this.Del_Att_Inner,
			Entity: iEntity,
			Entity_Id: iEntity_Id,
			File_Name: iFileName,
			On_Success: iOn_Success,
			On_Error: iOn_Error
		});

		this.Dispatch();
	};

	Del_Att_Inner = () => {
		const { Entity, Entity_Id, File_Name } = this.Current_Operation;

		this.DBs[Entity].removeAttachment(
			Entity_Id,
			File_Name,
			this.Docs[Entity + Entity_Id]._rev
		)
			.then(this.On_Put_Success)
			.catch(this.On_Put_Error);
	};

	Dispatch = () => {
		if (this.Queue.length === 0) {
			this.Log("Queue empty.");
			return;
		} else if (this.State === Server_States.Remote) {
			this.Log("Waiting for return...");
			return;
		}

		this.State = Server_States.Remote;
		this.Current_Operation = this.Queue.pop();

		const { Func, Entity, Operation_Id } = this.Current_Operation;

		this.Check_DB(Entity);

		this.Log("Dispatch: Handling operation on " + Entity);

		Func();

		setTimeout(this.Reset, 1000, Operation_Id);
	};

	On_Get_Success = iResponse => {
		this.Log("On_Get_Success: Returned successfully from Get operation.");

		const Operation = this.Current_Operation;
		const { Entity, Entity_Id } = Operation;

		if (Operation.On_Success) Operation.On_Success(iResponse);

		this.Current_Operation = null;
		this.State = Server_States.Local;

		this.Docs[Entity + Entity_Id] = iResponse;

		this.Dispatch();
	};

	On_Get_Error = iError => {
		this.Log("Returned with error from Get operation.");

		const Operation = this.Current_Operation;

		if (Operation.On_Error) Operation.On_Error(iError);

		this.Current_Operation = null;
		this.State = Server_States.Local;

		this.Dispatch();
	};

	On_Put_Success = iResponse => {
		this.Log("Returned successfully from Put operation.");

		const Operation = this.Current_Operation;
		const { Entity, Entity_Id } = Operation;

		if (Operation.On_Success) Operation.On_Success(iResponse);

		this.Current_Operation = null;
		this.State = Server_States.Local;

		this.Docs[Entity + Entity_Id]["_rev"] = iResponse.rev;

		this.Dispatch();
	};

	On_Put_Error = iError => {
		this.Log("Returned with error from New operation.");

		const Operation = this.Current_Operation;

		if (Operation.On_Error) Operation.On_Error(iError);

		this.Current_Operation = null;
		this.State = Server_States.Local;

		this.Dispatch();
	};

	On_New_Success = iResponse => {
		this.Log("Returned successfully from New operation.");

		const Operation = this.Current_Operation;
		const { Entity } = Operation;


		this.Current_Operation = null;
		this.State = Server_States.Local;

		this.Docs[Entity + iResponse.id] = {
			_rev: iResponse.rev,
			_id: iResponse.id
		};

		if (Operation.On_Success) Operation.On_Success(iResponse.id);

		this.Dispatch();
	};

	On_New_Error = iError => {
		this.Log("Returned with error from put operation.");

		const Operation = this.Current_Operation;

		if (Operation.On_Error) Operation.On_Error(iError);

		this.Current_Operation = null;
		this.State = Server_States.Local;

		this.Dispatch();
	};

	Log = (iMessage, iType = Message_Types.Info) => {
		const Message = "DB: " + iMessage;

		if (this.Verbose && iType === Message_Types.Info) {
			console.log(Message);
		} else if (this.Verbose && iType === Message_Types.Error) {
			console.error(Message);
		} else if (this.Verbose && iType === Message_Types.Warning) {
			console.warn(Message);
		} else {
			console.log("Verbose: " + this.Verbose);
		}
	};

	Reset = iOperation_Id => {
		const Operation = this.Queue.filter(Op => {
			return Op.Operation_Id === iOperation_Id;
		});

		if (Operation.length > 0) {
			this.Log(
				"Did not receive answer from the database. " +
					"Something wrong with Operation " +
					iOperation_Id +
					":",
				Message_Types.Error
			);
			this.Log(Operation);
		}
	};
}
