function mainEncoding() {
  const form = document.getElementById("pay-form");

  form.addEventListener("submit", function (evt) {
    evt.preventDefault();

    createBase64EncodedImage(evt.target);

    return false;
  });

  function createBase64EncodedImage(formElement) {
    const reader = new FileReader();
    reader.onloadend = async function () {
      console.log("encoded image:", reader.result);
      console.log("email:", formElement["email"].value);
      console.log("region:", formElement["region"].value);

      await postData(reader.result, formElement["email"].value, formElement["region"].value);
      window.location.reload();
    };

    reader.readAsDataURL(formElement["photo"].files[0]);
  }

  async function postData(data, email, region) {
    await fetch("/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: data, email: email, region: region }), // body data type must match "Content-Type" header
    });
  }
}

window.addEventListener("DOMContentLoaded", mainEncoding);

// TODO: First submit transaction to metamask, then if approved send post message.
