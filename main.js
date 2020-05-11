miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: "Generate Cards",
        svgIcon:
          '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
        positionPriority: 1,
        onClick: async () => {
          const authorized = await miro.isAuthorized();
          if (authorized) {
            generateCards();
          } else {
            miro.board.ui.openModal("not-authorized.html").then((res) => {
              if (res === "success") {
                generateCards();
              }
            });
          }
        },
      },
    },
  });
});

async function generateCards() {
  // get selected widgets
  let selectedWidgets = await miro.board.selection.get();
  let selectedShapes = [];
  let conversionShapeCount = 0;

  // filtering out shapes from all the selected widgets.
  for (element of selectedWidgets) {
    if (
      element.type === "SHAPE" ||
      element.type === "TEXT" ||
      element.type === "STICKER"
    ) {
      selectedShapes.push(element);
    }
  }

  conversionShapeCount = selectedShapes.length;
  // if selection is empty, exit gracefully.
  if (selectedShapes.length == 0) {
    miro.showNotification("Please select at least one shape");
  } else {
    //prompt
    // show number of selected eligible widget
    // check list
    // delete original content
    // include in a frame? (textfield to accept frame title)
    // create respective cards for selected widget
    let generatedCards = [];
    let x = 0.0;
    let y = -200.0;
    let verticalItemCount = 0;
    let maxVerticalItems = Math.floor(Math.sqrt(conversionShapeCount));
    for (element of selectedShapes) {
      let c = await generatCardFor(element, x, y);
      y = y + 120.0;
      verticalItemCount++;
      if (verticalItemCount > maxVerticalItems) {
        x = x + 300.0;
        verticalItemCount = 0;
        y = -200.0;
      }
      generatedCards.push(c);
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

async function generatCardFor(object, x, y) {
  let cardColor;

  if (object.type === "SHAPE") {
    //shape doesnt have tags
    //if shape has background color other than transparent then that will be card color otherwise shape's border color will be card color
    if (object.style.backgroundColor === "transparent") {
      if (object.style.borderColor === "transparent") {
        cardColor = "#2399f3"; // miro card default color #2399f3
      } else {
        cardColor = object.style.borderColor;
      }
    } else {
      cardColor = object.style.backgroundColor;
    }
  } else if (object.type === "TEXT") {
    //Text doesnt have tags
    //if text-box has background color other than transparent then that will be card color otherwise text-box's border color is other than transparent then that will be card color otherwise text-color will be card color
    if (object.style.backgroundColor === "transparent") {
      if (object.style.borderColor === "transparent") {
        if (object.style.textColor === "transparent") {
          cardColor = "#2399f3"; // miro card default color #2399f3
        } else {
          cardColor = object.style.textColor;
        }
      } else {
        cardColor = object.style.borderColor;
      }
    } else {
      cardColor = object.style.backgroundColor;
    }
  } else if (object.type === "STICKER") {
    //Stickers can have tags
    //sticker background color will be card color
    cardColor = object.style.stickerBackgroundColor;
  }

  let c = await miro.board.widgets.create({
    type: "card",
    title: object.plainText,
    x: x,
    y: y,
    style: {
      backgroundColor: cardColor,
    },
  });

  if(object.type === "STICKER") {
    // get all the tags of stickers
    let stickerTags = object.tags;
    // update widgetIds of each tags with adding generated cards id
    for (tag of stickerTags) {
      let freshTagObject = await miro.board.tags.get({id:tag.id});
      let updatedWidgetsIds = freshTagObject[0].widgetIds;
      updatedWidgetsIds.push(c[0].id);
      await miro.board.tags.update({id:tag.id,widgetIds:updatedWidgetsIds});
    }
  }
  return c[0];
}
