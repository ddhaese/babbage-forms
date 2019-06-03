# Introduction

This document describes a number of test cases that can help make the stage tool a robust application.

## A. Register Company
### A.1. Read-only
#### A.1.1 Read-Only form


| Description      | Value                                           |
|------------------|-------------------------------------------------|
| *Creation*       |                                                 |
| Time created     | 2019-05-29 17:17:49                             |
| Location         | `RegisterCompany.js>render`                     |
| Test             | `Context.Read_Only = false;`                    |
| Expected outcome | 1. A form with a read-only message              |
|                  | 2. All fields in the form are disabled          |
|                  | 3. No other messages within the form are shown. |
| *Outcome*        |                                                 |
| Test time        | NA                                              |
| Description      | NA                                              |
| Success          | NA                                              |

### A.2. Updating existing 