import "./processing.html";
import "./processing.css";

Template.processing.helpers({
  converting() {
    const id = Session.get("modelId");
    const model = ModelFiles.findOne({ _id: id });

    console.log(model, model.conversion == 100);
    return model.conversion < 100;
  }
});
