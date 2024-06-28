(({app, lib, globalVars}, functions) => {
  const {thisApp} = app;

  kintone.events.on(thisApp.event.detailShow(), async (e) => {
    const record = e.record;
    kintone.app.record.setFieldShown('uploaded', false);

    // const targetElement = $('.gaia-argoui-app-toolbar-statusmenu');
    const targetElement = kintone.app.record.getHeaderMenuSpaceElement();

    // put the button on the target element
    if (targetElement && record.uploaded.value === 'false') {
      const postBtn = $('<button>', {
        text: 'POST INTO PURCHASE ORDER APP',
        type: 'submit',
        class: 'btn btn-primary align-middle ml-3 mt-4 p-3',
        id: 'postBtn',
        visible: true,
        disabled: false,
      });

      $(targetElement).append(postBtn);

      // code when the button is clicked
      postBtn.on('click', async (event) => {
        event.preventDefault();

        try {
          await functions.convertExcelToRecord(e);
        } catch (error) {
          functions.showError(error);
        }
      });
    }

    return e;
  });

  kintone.events.on(thisApp.event.createEditShow(), async (e) => {
    kintone.app.record.setFieldShown('uploaded', false);

    return e;
  });
})(
  // eslint-disable-next-line no-undef
  init,
  // eslint-disable-next-line no-undef
  functions,
);
