const functions = (({ app, lib, globalVars }) => {
  const { thisApp } = app;

  return {
    handleStatusChange: async (e) => {
      const nextStatus = e.nextStatus.value;
      const record = e.record;
      const todayDate = lib.dt.now().toISODate(); // Get today's date in yyyy-mm-dd format

      const client = lib.client(app.purchasingDeptApp.token);
      const assignee = record.Assignee.value[0].code;

      // Function to calculate the difference in days between two dates
      const getDiffInDays = (startDate, endDate) =>
        lib.dt.fromISO(endDate).diff(lib.dt.fromISO(startDate), "days").days;

      // function to update the record with status date and time difference
      const updateRecord = (statusField, timeField, startDateField) => {
        record[statusField].value = todayDate;
        record[timeField].value = getDiffInDays(
          record[startDateField].value,
          todayDate
        );
      };

      switch (nextStatus) {
        case "In Progress":
          // Update record for "In Progress" status
          updateRecord(
            "Actual_In_Progress",
            "Time_In_Progress",
            "PO_Received_Date"
          );
          break;
        case "Awaiting Shipment":
          // Update record for "Awaiting Shipment" status
          updateRecord(
            "Actual_Awaiting_Shipment",
            "Time_Awaiting_Shipment",
            "Actual_In_Progress"
          );
          break;
        case "Resolved":
          // Update record for "Resolved" status
          updateRecord(
            "Actual_Resolved",
            "Time_Resolved",
            "Actual_Awaiting_Shipment"
          );

          // Calculate the total time from all statuses
          record.Total_Time.value =
            Number(record.Time_Resolved.value) +
            Number(record.Time_Awaiting_Shipment.value) +
            Number(record.Time_In_Progress.value);

          // remove the workload on the related user
          const getAssignee = await client.record.getAllRecords({
            app: app.purchasingDeptApp.id,
            condition: `Login_Name = "${assignee}"`,
            fields: ["$id", "Workload"],
          });

          await client.record.updateRecord({
            app: app.purchasingDeptApp.id,
            id: getAssignee[0].$id.value,
            record: {
              Workload: {
                value: Number(getAssignee[0].Workload.value) - 1,
              },
            },
          });

          break;
        default:
          console.warn("Unhandled process");
          break;
      }
    },
  };
})(
  // eslint-disable-next-line no-undef
  init
);
