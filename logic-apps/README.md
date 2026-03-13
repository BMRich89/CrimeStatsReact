# Logic Apps – ZIP Merge Workflow

This directory contains the **Azure Logic Apps Standard** workflow definition and supporting artefacts for the ZIP Merge process.

---

## Overview

The workflow:

1. Accepts an **HTTP POST** request with a mapping file name and a notification email address.
2. **Validates** the file name format and the CSV structure.
3. For every row in the mapping CSV:
   - Retrieves the `acquired` ZIP and the `SCID` ZIP from Azure Blob Storage.
   - Calls an **Azure Function** (`merge-zips-function`) to merge both ZIPs into a single archive.
   - Uploads the merged ZIP to the configured output path.
   - Records the per-row success or failure.
4. Sends a **completion email** (with a full per-row results table) to the requester.
5. On an unhandled workflow error, sends an **alert email** to the support team and returns HTTP 500.

---

## Directory structure

```
logic-apps/
├── host.json                          # Logic Apps Standard host configuration
├── connections.json                   # Managed API connection references
├── parameters.json                    # App-settings-backed parameter map
├── README.md                          # This file
├── zip-merge-workflow/
│   └── workflow.json                  # Complete stateful workflow definition
└── merge-zips-function/
    ├── host.json                      # Azure Functions host configuration
    ├── package.json                   # Node.js dependencies (jszip)
    └── index.js                       # Function implementation (HTTP trigger)
```

---

## Prerequisites

| Resource | Notes |
|---|---|
| Azure Logic Apps Standard plan | **Recommended.** Standard is used here because it supports `JavaScriptCode` actions without an Integration Account, uses `@appsetting()` references natively, and matches the `workflow.json` file-based deployment model. Logic Apps Consumption can also run `JavaScriptCode` actions but requires an Integration Account (Standard tier or higher). |
| Azure Blob Storage account | Single account used for all containers |
| Office 365 Outlook connector | Managed API connection for sending emails |
| Azure Function App (Node.js 18+) | Hosts the `MergeZips` HTTP function |

---

## App Settings (Environment Variables)

Configure the following application settings on the Logic Apps Standard resource:

| Setting | Description |
|---|---|
| `storageAccountName` | Azure Storage account name |
| `storageAccountKey` | Storage account access key (connection string) |
| `mappingFilesContainer` | Blob container that holds mapping CSV files |
| `mappingPath` | Folder path within `mappingFilesContainer` (e.g. `mappings`) |
| `acquiredFilesContainer` | Blob container for acquired ZIP files |
| `acquiredFilesPath` | Folder path within `acquiredFilesContainer` |
| `scidFilesContainer` | Blob container for SCID ZIP files |
| `scidFilesPath` | Folder path within `scidFilesContainer` |
| `mergedFilesPath` | Output folder path for merged ZIPs (within `scidFilesContainer`) |
| `supportEmail` | Email address that receives workflow failure alerts |
| `zipMergeFunctionUrl` | Full HTTPS URL of the `MergeZips` Azure Function |
| `zipMergeFunctionKey` | Function host key for the `MergeZips` function |
| `AZUREBLOB_CONNECTIONRUNTIMEURL` | Runtime URL of the Azure Blob Storage managed connection |
| `AZUREBLOB_AUTHENTICATION` | Authentication token/key for the Blob Storage connection |
| `OFFICE365_CONNECTIONRUNTIMEURL` | Runtime URL of the Office 365 managed connection |
| `OFFICE365_AUTHENTICATION` | Authentication token/key for the Office 365 connection |
| `WORKFLOWS_SUBSCRIPTION_ID` | Azure subscription ID (automatically injected by Logic Apps Standard) |
| `WORKFLOWS_LOCATION_NAME` | Azure region name (automatically injected by Logic Apps Standard) |
| `WORKFLOWS_RESOURCE_GROUP_NAME` | Resource group name (automatically injected by Logic Apps Standard) |

---

## HTTP Trigger

```
POST https://<logic-app-hostname>/api/zip-merge-workflow/triggers/When_HTTP_Request_Received/invoke?api-version=2022-05-01&sp=%2Ftriggers%2FWhen_HTTP_Request_Received%2Frun&sv=1.0&sig=<SAS>
Content-Type: application/json

{
  "mappingFileName": "counter-update-2024-01.csv",
  "emailAddress": "requester@example.com"
}
```

### Responses

| Status | Meaning |
|---|---|
| `200 OK` | All rows processed (some may have failed – see `results` array) |
| `400 Bad Request` | Validation failure (invalid filename, bad CSV headers, empty CSV, file not found) |
| `500 Internal Server Error` | Unhandled workflow exception – support team has been notified |

### 200 response body

```json
{
  "status": "Completed",
  "mappingFileName": "counter-update-2024-01.csv",
  "totalRows": 5,
  "succeeded": 4,
  "failed": 1,
  "notificationSentTo": "requester@example.com",
  "results": [
    {
      "acquiredid": "ACQ001",
      "SCID": "SC:ID:001",
      "status": "Success",
      "outputFile": "SC_ID_001.zip",
      "reason": null
    },
    {
      "acquiredid": "ACQ002",
      "SCID": "SC:ID:002",
      "status": "Failed",
      "outputFile": null,
      "reason": "Action: Get_Acquired_ZIP | Error: BlobNotFound"
    }
  ]
}
```

---

## Mapping CSV format

The mapping file **must**:

- Have a name that starts with `counter-update-` and ends with `.csv`.
- Contain **exactly two columns** with the header row `acquiredid,SCID`.
- Have at least one data row.

Example:

```csv
acquiredid,SCID
ACQ001,SC:ID:001
ACQ002,SC:ID:002
ACQ003,SC:ID:003
```

> **Note:** The `:` in SCID values is automatically replaced with `_` when constructing blob paths and output file names.

---

## Blob Storage layout

```
<storage account>
├── <mappingFilesContainer>/
│   └── <mappingPath>/
│       └── counter-update-*.csv          ← input mapping files
├── <acquiredFilesContainer>/
│   └── <acquiredFilesPath>/
│       └── {acquiredid}.zip              ← input acquired ZIPs
└── <scidFilesContainer>/
    ├── <scidFilesPath>/
    │   └── {SCID (: → _)}.zip           ← input SCID ZIPs
    └── <mergedFilesPath>/
        └── {SCID (: → _)}.zip           ← output merged ZIPs
```

---

## Deploying the workflow

### Using Azure Portal

1. Create a **Logic Apps Standard** resource.
2. Navigate to **Workflows** → **Add** → upload `zip-merge-workflow/workflow.json`.
3. Go to **Connections** and configure the `azureblob` and `office365` managed connections.
4. Add all required **App Settings** listed above.

### Using Azure CLI / Bicep / ARM

The `workflow.json` file can be deployed as part of an ARM template or via the Azure Functions Core Tools:

```bash
# Deploy using Azure Functions Core Tools (from the logic-apps/ directory)
func azure logicapp deploy --name <logic-app-name> --resource-group <resource-group>
```

---

## Deploying the MergeZips Azure Function

```bash
cd logic-apps/merge-zips-function
npm install

# Deploy to Azure
func azure functionapp publish <function-app-name>
```

Once deployed, copy the function URL and host key into the `zipMergeFunctionUrl` and `zipMergeFunctionKey` app settings on the Logic App.

---

## Error handling summary

| Layer | Strategy |
|---|---|
| Filename validation | Immediate `400` response + `Terminate` |
| File not found | Immediate `400` response + `Terminate` |
| CSV header validation | Immediate `400` response + `Terminate` |
| Empty CSV | Immediate `400` response + `Terminate` |
| Per-row blob/merge failures | Caught by `Row_Catch_Scope`; row recorded as `Failed`; processing continues |
| Transient blob/HTTP failures | Exponential backoff retry (3 attempts, up to 2 min between retries) |
| Unhandled workflow exception | `Catch_Workflow_Failure` scope sends alert to `supportEmail`; returns `500` |

---

## Idempotency

The workflow is **idempotent at the row level**: if the same mapping file is submitted twice, already-merged ZIPs in `mergedFilesPath` are **overwritten** (the blob upload uses `POST` which creates or replaces). Re-running after a partial failure will re-process all rows including those that previously succeeded.
