
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var img = new Image();
img.onload = function() {
    ctx.drawImage(img, 0, 0, 300, 500);
};
img.src = "/static/field.png";

// Get the input values and update the table
$("#input1").keyup(function() {
    var value = $(this).val();
    $("#player1").text(value);
});
$("#input2").keyup(function() {
    var value = $(this).val();
    $("#player2").text(value);
});
$("#input3").keyup(function() {
    var value = $(this).val();
    $("#player3").text(value);
});
$("#input4").keyup(function() {
    var value = $(this).val();
    $("#player4").text(value);
});
$("#input5").keyup(function() {
    var value = $(this).val();
    $("#player5").text(value);
});
$("#input6").keyup(function() {
    var value = $(this).val();
    $("#player6").text(value);
});
$("#input7").keyup(function() {
    var value = $(this).val();
    $("#player7").text(value);
});
$("#input8").keyup(function() {
    var value = $(this).val();
    $("#player8").text(value);
});
$("#input9").keyup(function() {
    var value = $(this).val();
    $("#player9").text(value);
});
$("#input10").keyup(function() {
    var value = $(this).val();
    $("#player10").text(value);
});
// Add more keyup functions as needed
