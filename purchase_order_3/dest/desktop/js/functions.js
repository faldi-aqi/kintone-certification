/* eslint-disable no-unused-vars */
const functions = (({app, lib, globalVars}) => {
  const {thisApp} = app;

  return {
    handleStatusChange: async (e) => {
      const nextStatus = e.nextStatus.value;
      const record = e.record;
      const todayDate = lib.dt.now().toISODate(); // Get today's date in yyyy-mm-dd format
      const assignee = record.customAssignee.value[0].code;

      // Function to calculate the difference in days between two dates
      const getDiffInDays = (startDate, endDate) => lib.dt.fromISO(endDate).diff(lib.dt.fromISO(startDate), 'days').days;

      // Function to update the record with status date and time difference
      const updateRecord = (statusField, timeField, startDateField) => {
        record[statusField].value = todayDate;
        record[timeField].value = getDiffInDays(record[startDateField].value, todayDate);
      };

      // Function to decrease assignee's workload by 1
      const decreaseWorkload = async () => {
        try {
          const client = lib.client(app.purchasingDeptApp.token);

          const getAssignee = await client.record.getAllRecords({
            app: app.purchasingDeptApp.id,
            condition: `Login_Name = "${assignee}"`,
            fields: ['$id', 'Workload'],
          });

          if (getAssignee.length > 0) {
            await client.record.updateRecord({
              app: app.purchasingDeptApp.id,
              id: getAssignee[0].$id.value,
              record: {
                Workload: {
                  value: Number(getAssignee[0].Workload.value) - 1,
                },
              },
            });
          } else {
            console.warn('Assignee not found for workload update.');
          }
        } catch (error) {
          console.error('Error updating assignee workload:', error);
        }
      };

      switch (nextStatus) {
        case 'In Progress':
          updateRecord('Actual_In_Progress', 'Time_In_Progress', 'PO_Received_Date');
          break;
        case 'Awaiting Shipment':
          updateRecord('Actual_Awaiting_Shipment', 'Time_Awaiting_Shipment', 'Actual_In_Progress');
          break;
        case 'Resolved':
          updateRecord('Actual_Resolved', 'Time_Resolved', 'Actual_Awaiting_Shipment');
          await decreaseWorkload(); // Call separate function to decrease workload
          break;
        default:
          console.warn('Unhandled process');
          break;
      }
    },

    addAssignBtn: async (e) => {
      const record = e.record;
      const recordId = record.$id.value;

      const isNotStarted = record.Status.value === 'Not started';

      if (isNotStarted) {
        // client with token of the purchase depart app and this app t
        const client = lib.client([app.purchasingDeptApp.token, app.thisApp.token]);

        // Get all the purchasing team data
        const purchasingTeams = await client.record.getAllRecords({
          app: app.purchasingDeptApp.id,
        });

        // Find the best fit person based on workload and expertise
        let {staffName, workload, expertise, loginName} = functions.findAssignee(purchasingTeams);

        // element to put the assign button
        const targetElement = kintone.app.record.getHeaderMenuSpaceElement();

        // put the button on the target element
        if (targetElement) {
          const autoAssignBtn = $('<button>', {
            text: 'Update and Auto Assign',
            type: 'submit',
            class: 'btn btn-success align-middle ml-3 mt-4 p-3',
            id: 'assignBtn',
            visible: true,
            disabled: false,
          });

          $(targetElement).append(autoAssignBtn);

          // code when the button is clicked
          autoAssignBtn.on('click', async (event) => {
            event.preventDefault();

            const showPopup = () => {
              let dropdownHtml = '<select id="teamMemberDropdown" class="form-control mb-2">';
              purchasingTeams.forEach((teamMember) => {
                dropdownHtml += `<option value="${teamMember.Login_Name.value}" data-workload="${teamMember.Workload.value}" data-expertise="${teamMember.Expertise_Score.value}">${teamMember.Staff_Name.value}</option>`;
              });
              dropdownHtml += '</select>';

              const popup = lib.Swal.fire({
                width: '800px',
                title: 'Update Status and Auto Assign',
                html: `
                            <div id="initialInfo">
                                <p class="m-4 p-4" style="font-size: 24px">
                                    Your best fit for this task is <b>${staffName}</b> with <b>${workload} workload</b>, and <b>${expertise} expertise point.</b>
                                </p>
                                <button id="chooseAnotherBtn" class="btn btn-warning">Choose Another Person</button>
                            </div>
                            <div id="dropdownContainer" style="display: none;">
                                ${dropdownHtml}
                                <p id="selectedPersonInfo" class="m-4 p-4" style="font-size: 24px"></p>
                            </div>
                        `,
                confirmButtonText: 'Assign Best Fit',
                focusConfirm: false,
                onOpen: () => {
                  $('#chooseAnotherBtn').on('click', () => {
                    $('#initialInfo').hide();
                    $('#dropdownContainer').show();
                  });

                  $('#teamMemberDropdown').on('change', function() {
                    const selectedOption = $(this).find('option:selected');

                    const selectedLoginName = selectedOption.val();
                    const selectedWorkload = selectedOption.data('workload');
                    const selectedExpertise = selectedOption.data('expertise');
                    const selectedName = selectedOption.text();

                    workload = selectedWorkload;
                    expertise = selectedExpertise;
                    loginName = selectedLoginName;
                    staffName = selectedName;

                    $('#selectedPersonInfo').html(
                      `Selected person: <b>${selectedName}</b> with <b>${selectedWorkload} workload</b>, and <b>${selectedExpertise} expertise point.</b>`,
                    );
                  });
                },
                preConfirm: async () => {
                  try {
                    lib.Swal.fire({
                      title: 'Loading...',
                      html: 'Updating Status and Assignment',
                    });
                    lib.Swal.showLoading();

                    // update the assignee
                    await client.record.updateRecordStatus({
                      app: app.thisApp.id,
                      id: recordId,
                      assignee: loginName,
                      action: 'PO Received',
                    });

                    // add the assigne into custom assignee
                    await client.record.updateRecord({
                      app: app.thisApp.id,
                      id: recordId,
                      record: {
                        customAssignee: {
                          value: [{code: loginName, name: staffName}],
                        },
                      },
                    });

                    // if success, get the related person and add the person workload
                    const getAssignee = await client.record.getAllRecords({
                      app: app.purchasingDeptApp.id,
                      condition: `Login_Name = "${loginName}"`,
                      fields: ['$id', 'Workload'],
                    });

                    await client.record.updateRecord({
                      app: app.purchasingDeptApp.id,
                      id: getAssignee[0].$id.value,
                      record: {
                        Workload: {
                          value: Number(getAssignee[0].Workload.value) + 1,
                        },
                      },
                    });

                    // Function to calculate deadlines based on today's date, skipping weekends
                    const calculateDeadlines = (dateToday) => {
                      // Parse today's date using Luxon
                      const today = lib.dt.fromISO(dateToday);

                      // Function to add days while skipping weekends (Saturday and Sunday)
                      const addBusinessDays = (date, daysToAdd) => {
                        let daysAdded = 0;
                        let currentDate = date;

                        while (daysAdded < daysToAdd) {
                          currentDate = currentDate.plus({days: 1});
                          if (currentDate.weekday !== 6 && currentDate.weekday !== 7) {
                            daysAdded += 1;
                          }
                        }
                        return currentDate;
                      };

                      // Calculate deadlines based on predefined durations, skipping weekends
                      let deadlineInProgressDate = addBusinessDays(today, 2);
                      let deadlineAwaitingShipmentDate = addBusinessDays(deadlineInProgressDate, 3);
                      let deadlineResolvedDate = addBusinessDays(deadlineAwaitingShipmentDate, 1);

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
                    };

                    const updateDateDeadline = async () => {
                      const todayDate = lib.dt.now().toISODate(); // Get today's date in yyyy-mm-dd format

                      // Calculate deadlines based on today's date
                      const {receivedPoDate, deadlineInProgressDate, deadlineAwaitingShipmentDate, deadlineResolvedDate} =
                        calculateDeadlines(todayDate);
                      record.PO_Received_Date.value = receivedPoDate;
                      record.Deadline_Awaiting_Shipment.value = deadlineAwaitingShipmentDate;
                      record.Deadline_In_Progress.value = deadlineInProgressDate;
                      record.Deadline_Resolved.value = deadlineResolvedDate;

                      await client.record.updateRecord({
                        app: app.thisApp.id,
                        id: record.$id.value,
                        record: {
                          PO_Received_Date: {
                            value: receivedPoDate,
                          },
                          Deadline_Awaiting_Shipment: {
                            value: deadlineAwaitingShipmentDate,
                          },
                          Deadline_In_Progress: {
                            value: deadlineInProgressDate,
                          },
                          Deadline_Resolved: {
                            value: deadlineResolvedDate,
                          },
                        },
                      });
                    };

                    // Update deadline for PO Received
                    await updateDateDeadline();

                    await lib.Swal.fire({
                      icon: 'success',
                      title: 'Success Update Status and Best Fit Assignee',
                    });

                    location.reload();
                  } catch (error) {
                    await lib.Swal.fire({
                      icon: 'error',
                      title: 'Update Status Failed',
                      text: error,
                    });
                    console.error(error);
                  }
                },
              });

              return popup;
            };

            showPopup();
          });
        } else {
          console.error('Target element is null. Ensure that the header menu space is enabled in the app settings.');
        }
      }
    },

    findAssignee: (arr) => {
      // Sort by workload ascending, expertise score descending, and login name alphabetically
      arr.sort((a, b) => {
        // Sort by workload (ascending)
        if (parseInt(a.Workload.value, 10) !== parseInt(b.Workload.value, 10)) {
          return parseInt(a.Workload.value, 10) - parseInt(b.Workload.value, 10);
        }

        // If workload is the same, sort by expertise score (descending)
        if (parseInt(b.Expertise_Score.value, 10) !== parseInt(a.Expertise_Score.value, 10)) {
          return parseInt(b.Expertise_Score.value, 10) - parseInt(a.Expertise_Score.value, 10);
        }

        // If both workload and expertise score are the same, sort by name
        return a.Login_Name.value.localeCompare(b.Login_Name.value);
      });

      // Return the first element after sorting (which meets the criteria of least workload, highest expertise, alphabetically by login name)
      return {
        loginName: arr[0].Login_Name.value,
        workload: arr[0].Workload.value,
        expertise: arr[0].Expertise_Score.value,
        staffName: arr[0].Staff_Name.value,
      };
    },
  };
})(
  // eslint-disable-next-line no-undef
  init,
);
