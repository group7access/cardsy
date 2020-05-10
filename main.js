miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: "Generate Card",
        svgIcon:
          '<circle cx="12" cy="12" r="7" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="4"/>',
        positionPriority: 1,
        onClick: async () => {
          // get selected widgets
          let selectedWidgets = await miro.board.selection.get();

          // if selection is empty, exit gracefully.
          if (selectedWidgets.length == 0) {
            miro.showNotification("Please select some shapes");
          } else {
            //prompt
                //show number of selected eligible widget
                    // check list
                    // delete original content
                    // include in a frame? (textfield to accept frame title)
            let response = await miro.board.ui.openModal('https://yashbhalodi.github.io/miroPlugin/dialogModal.html');
            console.log(response);
            // create respective cards for selected widget
            let generatedCards = [];
            let x = 0;
            let y = 100.0;
            let verticalItemCount = 0;
            for (element of selectedWidgets) {
              let c = await miro.board.widgets.create({
                type: "card",
                title: element.plainText,
                x: x,
                y: y,
              });
              y = y + 100.0;
              verticalItemCount++;
              if (verticalItemCount >= 5) {
                x = x + 350.0;
                verticalItemCount = 0;
                y = 100;
              }
              generatedCards.push(c[0]);
            }
            let generatedCardsId = [];
            for(element of generatedCards){
              generatedCardsId.push(element.id);
            }
            // select the generated card to accomodate user's quick actions
            await miro.board.selection.selectWidgets(generatedCardsId);
            // zoom to the first card generated
            await miro.board.viewport.zoomToObject(generatedCards);
            // create a frame and put all the generated card inside frame, if user has prompted
          }
        },
      },
    },
  });
});
