# FreshBooks Node SDK Changelog

## @freshbooks/api

### Unreleased

### 3.2.1

- Update error detection for Projects (See #450)

### 3.2.0

- Support Journal Entry (See #401)
- Support Journal Entry Accounts (See #401)
- Support Journal Entry Details (See #401)
- Support Expense Categories (See #402)

### 3.1.0

- Allow invoices to be marked as sent
- Support for Profit & Loss Report
- Support for Tax Summary Report
- Support for Payments Collected Report
- Fix bug in BillVendors (See #399)

### 3.0.0

- (**Breaking Change**) `token` parameter removed from APIClient constructor, additional properties added to Client
  Options to support OAuth flow with client secret + redirect URI (see updated README)
- Support for online payment options
- Move default branch from master to main

### 2.1.0

- Support for invoice share links
- Support for webhook callback registration
- Allow create/update payloads items to accept strings in addition to date objects

### 2.0.1

- Fix to axios upgrade that broke GET calls
- Support for credit notes

### 2.0.0

- (**Breaking Change**) FreshBooks application clientId added to APIClient
  constructor instead of optional (but not actually optional) param
- (**Breaking Change**) Fix types on data models
- (**Breaking Change**) Rename models to better fit coding conventions
- Support Bills, Bill Payments, Bill Vendors endpoints
- Support Tasks endpoint

### 1.5.0

- Allow setting of user-agent string
- Fixed naming conventions for time entry and other income

### 1.4.0

- Added Other Income resource
- Fixed user.me() call for partially setup businesses

### 1.3.0

- Added Project resource
- Client model fixes
- Standardize date/time objects to UTC (accounting endpoints return data in EST)

### 1.2.0

- Added TimeEntry resource

### 1.1.3

- `like` filters no longer automatically append `_like` to the search key.
  Correct key must now be provided.
- Fix issue where `in` filters were not correctly being generated.

### 1.1.2

- Now retrying on 429 errors on POST, PUT
- Tune retries to 10 attempts (was 3)

### 1.1.0

- Added default retries with backoff on failed API calls

## @freshbooks/app

### Unreleased

- Move default branch from master to main

### 2.0.0

- (**Breaking Change**) Updated to latest breaking api changes.
