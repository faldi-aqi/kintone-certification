(({app, lib, globalVars}, functions) => {
  const {thisApp} = app;

  kintone.events.on(thisApp.event.createEditShow(), (e) => {
    console.log({e});

    console.log('heeheheheheheh');

    return e;
  });

  kintone.events.on(thisApp.event.detailShow(), async (e) => {
    await functions.addAssignBtn(e);

    return e;
  });

  kintone.events.on(thisApp.event.updateStatus(), async (e) => {
    console.log({e});

    // Function that will handle the status change based on the next status
    await functions.handleStatusChange(e);

    return e;
  });
})(
  // eslint-disable-next-line no-undef
  init,
  // eslint-disable-next-line no-undef
  functions,
);
