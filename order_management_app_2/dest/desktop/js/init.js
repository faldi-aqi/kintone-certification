/* eslint-disable no-undef */
const init = {
  app: {
    thisApp: {
      id: kintone.app.getId(),
      token: '',
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
        indexShow: () => ['app.record.index.show'],
        createEditShow: () => [
          'app.record.create.show',
          'app.record.edit.show',
        ],
        detailShow: () => [`app.record.detail.show`],
        submit: () => [`app.record.create.submit`, `app.record.edit.submit`],
        submitSuccess: () => [
          `app.record.create.submit.success`,
          `app.record.edit.submit.success`,
        ],
      },
    },
    purchaseOrderApp: {
      id: 3,
      token: 'RWVz83n5bJgi4OTb4myu4o1w2U2smQuoPuoRbvuX'
    },
    purchasingDeptApp: {
      id: 6,
      token: 'iHkEjjx6byBi4EIZMYUBQVvSruYVRPuFwB5WZJHn'
    }
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
