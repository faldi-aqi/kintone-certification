/* eslint-disable no-undef */
const init = {
  app: {
    purchasingDeptApp: {
      id: 6,
      token: 'iHkEjjx6byBi4EIZMYUBQVvSruYVRPuFwB5WZJHn'
    },
    thisApp: {
      id: kintone.app.getId(),
      token: "",
      fieldCode: {
        deliveryAddress: "Delivery_Address",
        customerName: "Customer_Name",
        totalAmount: "Total_Amount",
        billToCompany: "Bill_To_Company",
        salesTax: "Sales_Tax",
        deadlineResolved: "Deadline_Resolved",
        updatedBy: "Updated_by",
        poReceivedDate: "PO_Received_Date",
        createdDatetime: "Created_datetime",
        recordNumber: "Record_number",
        fob: "Fob",
        deliverTo: "Deliver_To",
        createdBy: "Created_by",
        deliverToCompany: "Deliver_To_Company",
        startDate: "Start_Date",
        orderedBy: "Ordered_By",
        billTo: "Bill_To",
        status: "Status",
        assignee: "Assignee",
        deadlineInProgress: "Deadline_In_Progress",
        categories: "Categories",
        terms: "Terms",
        billAddress: "Bill_Address",
        subtotal: "Subtotal",
        orderInfo: "Order_Info",
        date: "Date",
        shippedVia: "Shipped_Via",
        updatedDatetime: "Updated_datetime",
        cancelDate: "Cancel_Date",
        table: {
          orderList: {
            fieldCode: "Order_List",
            columns: {
              description: "Description",
              amount: "Amount",
              unit: "Unit",
              unitPrice: "Unit_Price",
            },
          },
        },
        poNumber: "Po_Number",
        deadlineAwaitingShipment: "Deadline_Awaiting_Shipment",
        orderDetail: "Order_Detail",
        customerAddress: "Customer_Address",
        customerCompanyName: "Customer_Company_Name",
      },
      event: {
        indexShow: () => ["app.record.index.show"],
        createEditShow: () => [
          "app.record.create.show",
          "app.record.edit.show",
        ],
        detailShow: () => [`app.record.detail.show`],
        submit: () => [`app.record.create.submit`, `app.record.edit.submit`],
        submitSuccess: () => [
          `app.record.create.submit.success`,
          `app.record.edit.submit.success`,
        ],
        updateStatus: () => [`app.record.detail.process.proceed`],
      },
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
