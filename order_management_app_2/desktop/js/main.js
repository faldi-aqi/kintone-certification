((
  {
    app,
    lib,
    globalVars
  },
  functions
) => {
  const {thisApp} = app;

  kintone.events.on(thisApp.event.createEditShow(), e => {
    console.log({e});

    return e;
  });


  kintone.events.on(thisApp.event.submitSuccess(), async (e) => {
    console.log({e});


    try {

      const client = lib.client(app.purchaseOrderApp.token);
      const records = await functions.generateBodyRecordsPo(e);
      const body = {
        app: app.purchaseOrderApp.id,
        records
      };
      console.log('hehe');
      // const result = await client.record.addRecords(body);

      // console.log({result});
    } catch (error) {
      console.error(error);
    }

    return e;
  });


  kintone.events.on(thisApp.event.indexShow(), e => {
    console.log({e});

    return e;
  });


  kintone.events.on(thisApp.event.submit(), e => {


    return e;

  });
})(
  // eslint-disable-next-line no-undef
  init,
  // eslint-disable-next-line no-undef
  functions
);