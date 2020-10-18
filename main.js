miro.onReady(() => {
  const icon =
    '<svg> <rect x="1" y="3" rx="1" ry="1" width="18" height="12" fill-rule="evenodd" fill="#ffffff" stroke="currentColor" stroke-width="2" opacity="1.0"/><rect x="1" y="3" rx="0" ry="1" width="2" height="12" fill-rule="evenodd" fill="currentColor" opacity="1.0" /><rect x="5" y="10" rx="1" ry="1" width="18" height="12" fill-rule="evenodd" fill="#ffffff" stroke="currentColor" stroke-width="2" opacity="1.0"/><rect x="5" y="10" rx="0" ry="1" width="2" height="12" fill-rule="evenodd" fill="currentColor" opacity="1.0" /><rect x="9" y="18" rx="0.5" ry="0.5" width="5" height="2" fill-rule="evenodd" fill="currentColor" opacity="0.3" /><rect x="16" y="18" rx="0.5" ry="0.5" width="5" height="2" fill-rule="evenodd" fill="currentColor" opacity="0.3" /></svg>';

  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: "Cardsy",
        tooltip: "Generate Cards",
        svgIcon: icon,
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
  selectedShapes = selectedWidgets.filter((item) => {
    return item.type === "SHAPE" ||
      item.type === "TEXT" ||
      item.type === "STICKER"
      ? true
      : false;
  });

  conversionShapeCount = selectedShapes.length;
  // if selection is empty, exit gracefully.
  if (selectedShapes.length == 0) {
    miro.showNotification("Select at least one shape, sticker or text");
  } else {
    //prompt
    // show number of selected eligible widget
    // check list
    // delete original content
    // include in a frame? (textfield to accept frame title)
    // create respective cards for selected widget
    let generatedCards = [];
    let x = selectedWidgets[0].x;
    let y = selectedWidgets[0].y + 100.0;
    let verticalItemCount = 0;
    let maxVerticalItems = Math.floor(Math.sqrt(conversionShapeCount));
    for (element of selectedShapes) {
      let c = await generatCardFor(element, x, y);
      y = y + 100.0;
      verticalItemCount++;
      if (verticalItemCount > maxVerticalItems) {
        x = x + 330.0;
        verticalItemCount = 0;
        y = selectedWidgets[0].y + 100.0;
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

  if (object.type === "STICKER") {
    // get all the tags of stickers
    let stickerTags = object.tags;
    // update widgetIds of each tags with adding generated cards id
    for (tag of stickerTags) {
      let freshTagObject = await miro.board.tags.get({ id: tag.id });
      let updatedWidgetsIds = freshTagObject[0].widgetIds;
      updatedWidgetsIds.push(c[0].id);
      await miro.board.tags.update({
        id: tag.id,
        widgetIds: updatedWidgetsIds,
      });
    }
  }
  return c[0];
}
