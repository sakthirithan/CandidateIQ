# Core Module: File Storage & Parsing Infrastructure

## 1. Overview
Document upload and syntax extraction infrastructure handling resume files (`PDF`, `DOCX`, `TXT`) up to 10 MB in memory buffers and FileReader previews.

## 2. Status
✅ IMPLEMENTED

## 3. Implementation Details
- Express Multer middleware (`uploadMiddleware.js`) storing file buffers in memory.
- `pdf-parse` library extracting plain text from PDF documents.
- Client `FileReader` reading text files (`.txt`) and binary preview buffers.
- Document validation rules (file type extension check, maximum 10 MB size limit).

## 4. Source Files
- [`server/middleware/uploadMiddleware.js`](file:///d:/Mini-Project/server/middleware/uploadMiddleware.js)
- [`client/src/services/mockApi/resumeParserService.js`](file:///d:/Mini-Project/client/src/services/mockApi/resumeParserService.js)
