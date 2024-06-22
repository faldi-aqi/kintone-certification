/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const functions = (({ app, lib, globalVars }) => {
  const { thisApp } = app;

  return {
    showLoading: (text) => {
      Swal.fire({
        title: "Loading",
        text: text,
        allowOutsideClick: false,
        onBeforeOpen: () => {
          scanningAllowed = false;
          Swal.showLoading();
        },
      });
    },

    hideLoading: () => {
      Swal.close();
    },

    showSuccess: (text) => {
      Swal.fire({
        title: "Success",
        text,
        icon: "success",
      });
    },

    showError: (text) => {
      Swal.fire({
        icon: "error",
        title: "ERROR",
        text: text,
      });
    },

    findAssignee: (arr) => {
      // Sort by workload ascending, expertise score descending, and login name alphabetically
      arr.sort((a, b) => {
        // Sort by workload (ascending)
        if (parseInt(a.Workload.value, 10) !== parseInt(b.Workload.value, 10)) {
          return (
            parseInt(a.Workload.value, 10) - parseInt(b.Workload.value, 10)
          );
        }

        // If workload is the same, sort by expertise score (descending)
        if (
          parseInt(b.Expertise_Score.value, 10) !==
          parseInt(a.Expertise_Score.value, 10)
        ) {
          return (
            parseInt(b.Expertise_Score.value, 10) -
            parseInt(a.Expertise_Score.value, 10)
          );
        }

        // If both workload and expertise score are the same, sort by name
        return a.Login_Name.value.localeCompare(b.Login_Name.value);
      });

      // Return the first element after sorting (which meets the criteria of least workload, highest expertise, alphabetically by login name)
      return {
        assignee: arr[0].Login_Name.value,
        id: arr[0].$id.value,
        workload: arr[0].Workload.value,
      };
    },

    // Function to calculate deadlines based on today's date, skipping weekends
    calculateDeadlines: (todayDate) => {
      // Parse today's date using Luxon
      const today = lib.dt.fromISO(todayDate);

      // Function to skip weekends (Saturday and Sunday)
      const skipWeekends = (date) => {
        while (date.weekday === 6 || date.weekday === 7) {
          // 6 = Saturday, 7 = Sunday
          // eslint-disable-next-line no-param-reassign
          date = date.plus({ days: 1 });
        }
        return date;
      };

      // Calculate deadlines based on predefined durations, skipping weekends
      let deadlineInProgressDate = skipWeekends(today.plus({ days: 2 }));
      let deadlineAwaitingShipmentDate = skipWeekends(
        deadlineInProgressDate.plus({ days: 3 })
      );
      let deadlineResolvedDate = skipWeekends(
        deadlineAwaitingShipmentDate.plus({ days: 1 })
      );

      // Convert dates to ISO date strings
      const receivedPoDate = today.toISODate();
      deadlineInProgressDate = deadlineInProgressDate.toISODate();
      deadlineAwaitingShipmentDate = deadlineAwaitingShipmentDate.toISODate();
      deadlineResolvedDate = deadlineResolvedDate.toISODate();

      return {
        receivedPoDate,
        deadlineInProgressDate,
        deadlineAwaitingShipmentDate,
        deadlineResolvedDate,
      };
    },

    convertExcelToRecord: async (e) => {
      const records = [];
      const record = e.record;

      const attachments = record.Excel_Attachment.value;
      const startDate = new Date(1900, 0, 1); // Assuming Excel for Windows

      functions.showLoading("Please wait added new records on purchase order");

      // Process each table
      for (const attachment of attachments) {
        // const tableAttachment = table.value.Excel_Attachment.value[0]; // change to this index/item attachemnt
        const excelData = await fetchAndParseExcel(attachment.fileKey);

        console.log({ excelData });
        const customerInfo = {
          name: excelData[6][0].split(/\r?\n/)[0],
          company: excelData[6][0].split(/\r?\n/)[1],
          address: excelData[6][0].split(/\r?\n/)[2],
        };

        const billInfo = {
          name: excelData[6][3].split(/\r?\n/)[0],
          company: excelData[6][3].split(/\r?\n/)[1],
          address: excelData[6][3].split(/\r?\n/)[2],
        };

        const deliveryInfo = {
          name: excelData[6][7].split(/\r?\n/)[0],
          company: excelData[6][7].split(/\r?\n/)[1],
          address: excelData[6][7].split(/\r?\n/)[2],
        };

        const purchaseItemTable = extractPurchaseItems(excelData);

        // Example usage:
        const todayDate = lib.dt.now().toISODate(); // Get today's date in yyyy-mm-dd format

        // Calculate deadlines based on today's date
        const {
          receivedPoDate,
          deadlineInProgressDate,
          deadlineAwaitingShipmentDate,
          deadlineResolvedDate,
        } = functions.calculateDeadlines(todayDate);

        const newRecord = {
          PO_Received_Date: { value: receivedPoDate },
          Deadline_Awaiting_Shipment: { value: deadlineAwaitingShipmentDate },
          Deadline_In_Progress: { value: deadlineInProgressDate },
          Deadline_Resolved: { value: deadlineResolvedDate },
          Bill_Address: { value: billInfo.address },
          Bill_To_Company: { value: billInfo.company },
          Cancel_Date: { value: formatDateFromExcel(excelData[8][0]) },
          Customer_Address: { value: customerInfo.address },
          Bill_To: { value: billInfo.name },
          Customer_Company_Name: { value: customerInfo.company },
          Customer_Name: { value: customerInfo.name },
          Date: {
            value: formatDateFromExcel(excelData[3][excelData[3].length - 1]),
          },
          Po_Number: { value: excelData[2][excelData[2].length - 1] },
          Shipped_Via: { value: excelData[8][4] },
          Start_Date: { value: formatDateFromExcel(excelData[8][1]) },
          Terms: { value: excelData[8][9] },
          Deliver_To: { value: deliveryInfo.name },
          Deliver_To_Company: { value: deliveryInfo.company },
          Delivery_Address: { value: deliveryInfo.address },
          Fob: { value: excelData[8][7] },
          Ordered_By: { value: excelData[8][2] },
          Order_List: { value: purchaseItemTable },
        };

        try {
          const client = await lib.client([
            app.purchaseOrderApp.token,
            app.purchasingDeptApp.token,
          ]);

          // add record/post, save the id
          const postResult = await client.record.addRecord({
            app: app.purchaseOrderApp.id,
            record: newRecord,
          });

          const recordId = postResult.id;

          // get all the purchasing team data
          const purchasingTeams = await client.record.getAllRecords({
            app: app.purchasingDeptApp.id,
          });

          // get the best fit person that has low workload and based on the expertise
          const { assignee, id, workload } =
            functions.findAssignee(purchasingTeams);

          // update the status and assign the person the value
          const updateStatusResult = await client.record.updateRecordStatus({
            app: app.purchaseOrderApp.id,
            id: recordId,
            action: "Start",
            assignee,
          });

          // update the workload on the person
          const updateAssigneeResult = await client.record.updateRecord({
            app: app.purchasingDeptApp.id,
            id,
            record: {
              Workload: {
                value: Number(workload) + 1,
              },
            },
          });

          functions.showSuccess("Success add PO and assign!");
        } catch (error) {
          console.error(error);
          functions.showError(error);
        }

        functions.hideLoading();
      }

      // FETCH THE File
      async function downloadFileContent(sigFileKey) {
        const client = lib.client();
        const downloadedData = await client.file.downloadFile({
          fileKey: sigFileKey,
        });

        return downloadedData;
      }

      // Function to fetch and parse Excel file content
      async function fetchAndParseExcel(fileKey) {
        const fileContent = await downloadFileContent(fileKey);
        const workbook = XLSX.read(fileContent, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      }

      // Function to extract purchase item table data from Excel
      function extractPurchaseItems(excelData) {
        const purchaseItemTable = [];
        for (let i = 10; i < excelData.length; i++) {
          const row = excelData[i];
          if (!row[0] && !excelData[i + 1][0]) break;
          purchaseItemTable.push({
            value: {
              Unit: { value: row[0] },
              Description: { value: row[1] },
              Unit_Price: { value: row[7] },
              Amount: { value: row[9] },
            },
          });
        }
        return purchaseItemTable;
      }

      // Function to format date from Excel serial number
      function formatDateFromExcel(excelSerialDate) {
        if (typeof excelSerialDate === "number") {
          const date = new Date(
            startDate.getTime() + excelSerialDate * 86400000
          );
          return date.toISOString().split("T")[0];
        }
        return "";
      }

      return records;
    },
  };
})(
  // eslint-disable-next-line no-undef
  init
);
