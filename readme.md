# Customer Order Management System With Kintone Document

**Title**: Customer Order Management System With Kintone

**Revision History**:

- Version 0.1 - Initial draft by Muhamad Rifaldi on 12-06-2024.
- Version 0.2 - New Process Mangement by Muhamad Rifaldi on 20-06-2024.
- Version 1.0 - Alpha Version by Muhamad Rifaldi on 12-06-2024.

---

## Introduction

**Purpose**:
This document outlines the specifications for a Customer Order Management System designed to convert Excel files into purchase order records and efficiently manage the workflow of these orders.

**Scope**:
This document encompasses the requirements for converting customer order Excel spreadsheets into purchase order records within Kintone, updating purchase order statuses, implementing intelligent auto-assignment based on expertise and workload, automatically calculating process date deadlines, displaying performance measurement charts, and ensuring timely completion with deadline reminder notifications.

---

## Overall Description

**Product Perspective**:
The Customer Order Management System consists of the Order Management App, Purchase Order App, and Purchasing Department App. These apps are integrated to streamline the entire order processing workflow.

**Product Functions**:

- Convert and read customer order Excel spreadsheets into purchase order records.
- Update purchase order statuses with intelligent auto-assignment based on workload and expertise.
- Automatically calculate each process deadline, intelligently excluding weekends.
- Send reminders for approaching deadlines to assignees.

**User Characteristics**:

- Kintone users, employees, or salespersons with access to the Order Management App.
- Members of the purchasing department with access to the Purchase Order App.

**Assumptions and Dependencies**:

- Excel files follow a specific order format.
- Each customer order has a unique PO number and cannot be duplicated.
- Users have the necessary permissions in Kintone.

---

## Specific Requirements

**Functional Requirements**:

1. **Convert Customer Order Excel Files to Purchase Order Records**:

   - Multiple Excel attachments can be uploaded.
   - Each attachment generates a new record in the Purchase Order App.
   - Fields in the Purchase Order App are populated based on the Excel data.

2. **Update Purchase Order Status**:

   - Status changes to "PO Received" upon record creation.

3. **Intelligently Auto-assign Tasks**:

   - Assign tasks to the purchasing department member with the least workload and highest expertise.
   - Based on data from the Purchasing Department App.

4. **Calculate Process Dates**:

   - Automatically calculate deadline dates excluding weekends.
   - PO Received (creation date), In Progress (2 days), Awaiting Shipment (3 days), Resolved (1 day).
   - Update dates and days spent between processes as they advance.

5. **Set Reminders**:
   - Send reminders at 8 AM one day before the deadline.

**Non-functional Requirements**:

1. **Performance**:

   - The app should handle up to 100 concurrent users.
   - Excel parsing should complete within 5 seconds per file.

2. **Usability**:
   - User-friendly interface for uploading and managing files.

---

## Use Cases

**Use Case 1**: Convert and Upload Customer Order Excel Files

- **Actor**: User
- **Description**: User uploads customer order Excel files, which are then converted into purchase order records.
- **Preconditions**: User has logged in and accessed the Order Management App, and the customer order has a unique order number.
- **Postconditions**: New purchase order records are created, the status is updated to "PO Received", and the record is assigned to a purchasing department member with the best expertise and least workload.

---

## System Architecture

**High-Level Design**:

- Client-server architecture using Kintone platform APIs.
- Excel parsing module integrated with Kintone using custom JavaScript code for record creation and status updates.

---

## Constraints

**Software Constraints**:

- The application must run on the Kintone platform.

**Regulatory Requirements**:

- The system must comply with company data protection policies.

---

## Appendices

**Glossary**:

- **Kintone**: A cloud-based platform for building and deploying custom business applications.
- **PO**: Purchase Order

**Related Documents**:

- Kintone API Documentation

---
