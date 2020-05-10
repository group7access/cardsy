miro.onReady(() => {

  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: "Generate Cards",
        svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
        positionPriority: 1,
        onClick: async () => {
          const authorized = await miro.isAuthorized()
          console.log(authorized);
					if (authorized) {
						generateCards();
					} else {
						miro.board.ui.openModal('not-authorized.html')
							.then(res => {
								if (res === 'success') {
									clearAllContent()
								}
							})
					}
        },
      },
    },
  });
});

async function generateCards(){
  // get selected widgets
  let selectedWidgets = await miro.board.selection.get();
  let selectedShapes = [];
  let conversionShapeCount = 0;

  // filtering out shapes from all the selected widgets.
  for (element of selectedWidgets) {
    if(element.type === "SHAPE" || element.type === "TEXT" || element.type === "STICKER"){
      selectedShapes.push(element);
    }
  }

  conversionShapeCount = selectedShapes.length;
  // if selection is empty, exit gracefully.
  if (selectedShapes.length == 0) {
    miro.showNotification("Please select at least one shape");
  } else {
    //prompt
    //show number of selected eligible widget
    // check list
    // delete original content
    // include in a frame? (textfield to accept frame title)
    // create respective cards for selected widget
    let generatedCards = [];
    let x = 0;
    let y = 100.0;
    let verticalItemCount = 0;
    for (element of selectedShapes) {
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
    for (element of generatedCards) {
      generatedCardsId.push(element.id);
    }
    // select the generated card to accomodate user's quick actions
    await miro.board.selection.selectWidgets(generatedCardsId);
    console.log(`Cardsy generated ${conversionShapeCount} cards for you.`);
    miro.showNotification(`Cardsy generated ${conversionShapeCount} cards.`);
    // zoom to the frame generated
    // create a frame and put all the generated card inside frame, if user has prompted
  }
}