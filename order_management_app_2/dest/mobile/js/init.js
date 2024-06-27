/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
const init = {
  app: {
    thisApp: {
      id: kintone.mobile.app.getId(),
      token: '5FhnNoZ848ojs1ZqxRFw6ISG5OVdqW8ZrFgVEsrT',
      fieldCode: {
        status: 'Status',
        assignee: 'Assignee',
        updatedDatetime: 'Updated_datetime',
        createdDatetime: 'Created_datetime',
        categories: 'Categories',
        recordNumber: 'Record_number',
        createdBy: 'Created_by',
        table: {
          orderManagement: {
            fieldCode: 'Order_Management_Table',
            columns: {
              excelAttachment: 'Excel_Attachment',
              receivedDate: 'Received_Date',
              notes: 'Notes',
            },
          },
        },
        updatedBy: 'Updated_by',
      },
      event: {
        indexShow: () => ['mobile.app.record.index.show'],
        createEditShow: () => ['mobile.app.record.create.show', 'mobile.app.record.edit.show'],
        detailShow: () => [`mobile.app.record.detail.show`],
        submit: () => [`mobile.app.record.create.submit`, `mobile.app.record.edit.submit`],
        submitSuccess: () => [`mobile.app.record.create.submit.success`, `mobile.app.record.edit.submit.success`],
      },
    },
    purchaseOrderApp: {
      id: 3,
      token: 'RWVz83n5bJgi4OTb4myu4o1w2U2smQuoPuoRbvuX',
    },
    purchasingDeptApp: {
      id: 6,
      token: 'iHkEjjx6byBi4EIZMYUBQVvSruYVRPuFwB5WZJHn',
    },
  },
  lib: {
    client: (apiToken) => {
      const opt = apiToken
        ? {
          auth: {
            apiToken,
          },
        }
        : {};

      return new KintoneRestAPIClient(opt);
    },
    Swal,
    Kuc: Kuc,
    dt: luxon.DateTime,
  },
  globalVars: {},
};
