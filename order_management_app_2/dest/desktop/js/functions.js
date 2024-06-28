/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const functions = (({app, lib, globalVars}) => {
  const {thisApp} = app;

  return {
    showLoading: (text) => {
      Swal.fire({
        title: 'Loading',
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
        title: 'Success',
        text,
        icon: 'success',
      });
    },

    showError: (text) => {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: text,
      });
    },

    convertExcelToRecord: async (e) => {
      const records = [];
      const record = e.record;
      const recordId = record.$id.value;

      const attachments = record.Excel_Attachment.value;
      const startDate = new Date(1900, 0, 1); // Assuming Excel for Windows

      functions.showLoading('Please wait added new records on purchase order');

      // find duplicate po
      const tempPoObj = {};

      // Process each table
      for (const attachment of attachments) {
        const excelData = await functions.fetchAndParseExcel(attachment.fileKey);

        // validation for format
        if (
          excelData[0][4] !== 'PURCHASE ORDER' ||
          excelData[2][6] !== 'P.O. NUMBER:' ||
          excelData[9][0] !== 'Unit' ||
          excelData[7][0] !== 'START DATE'
        ) {
          functions.showError('Excel Not Match the Format, Please Change Attachments');
          return false;
        }

        // validation for po number
        if (!tempPoObj[excelData[2][9]]) {
          tempPoObj[excelData[2][9]] = true;
        } else {
          functions.showError('Duplicate PO Number found');
          return false;
        }

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

        const newRecord = {
          Bill_Address: {value: billInfo.address},
          Bill_To_Company: {value: billInfo.company},
          Cancel_Date: {value: formatDateFromExcel(excelData[8][0])},
          Customer_Address: {value: customerInfo.address},
          Bill_To: {value: billInfo.name},
          Customer_Company_Name: {value: customerInfo.company},
          Customer_Name: {value: customerInfo.name},
          Date: {
            value: formatDateFromExcel(excelData[3][excelData[3].length - 1]),
          },
          Po_Number: {value: excelData[2][excelData[2].length - 1]},
          Shipped_Via: {value: excelData[8][4]},
          Start_Date: {value: formatDateFromExcel(excelData[8][1])},
          Terms: {value: excelData[8][9]},
          Deliver_To: {value: deliveryInfo.name},
          Deliver_To_Company: {value: deliveryInfo.company},
          Delivery_Address: {value: deliveryInfo.address},
          Fob: {value: excelData[8][7]},
          Ordered_By: {value: excelData[8][2]},
          Order_List: {value: purchaseItemTable},
        };

        records.push(newRecord);
      }

      try {
        const client = await lib.client([app.purchaseOrderApp.token, app.purchasingDeptApp.token, app.thisApp.token]);

        // add record/post
        await client.record.addRecords({
          app: app.purchaseOrderApp.id,
          records,
        });

        // flag that the excel is uploaded
        await client.record.updateRecord({
          app: thisApp.id,
          id: recordId,
          record: {
            uploaded: {
              value: 'true',
            },
          },
        });

        functions.showSuccess('Success add PO and assign!');
      } catch (error) {
        console.error(error);
        functions.showError(error);
      }

      // Function to extract purchase item table data from Excel
      function extractPurchaseItems(excelData) {
        const purchaseItemTable = [];
        for (let i = 10; i < excelData.length; i++) {
          const row = excelData[i];
          if (!row[0] && !excelData[i + 1][0]) break;
          purchaseItemTable.push({
            value: {
              Unit: {value: row[0]},
              Description: {value: row[1]},
              Unit_Price: {value: row[7]},
              Amount: {value: row[9]},
            },
          });
        }
        return purchaseItemTable;
      }

      // Function to format date from Excel serial number
      function formatDateFromExcel(excelSerialDate) {
        if (typeof excelSerialDate === 'number') {
          const date = new Date(startDate.getTime() + excelSerialDate * 86400000);
          return date.toISOString().split('T')[0];
        }
        return '';
      }

      return records;
    },

    // Function to fetch and parse Excel file content
    fetchAndParseExcel: async (fileKey) => {
      // FETCH THE File
      async function downloadFileContent(sigFileKey) {
        const client = lib.client(app.thisApp.token);
        const downloadedData = await client.file.downloadFile({
          fileKey: sigFileKey,
        });

        return downloadedData;
      }

      const fileContent = await downloadFileContent(fileKey);
      const workbook = XLSX.read(fileContent, {type: 'binary'});
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      return XLSX.utils.sheet_to_json(worksheet, {header: 1});
    },
  };
})(
  // eslint-disable-next-line no-undef
  init,
);
