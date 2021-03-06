const PLAYER1_ID = 1;
const PLAYER2_ID = 2;

const AREA0_ID = 0 ;
const AREA1_ID = 1 ;
const AREA2_ID = 2 ;
const AREA3_ID = 3 ;

const EMPTY=0;
const PIECEX=1;
const PIECEY=2;
const NO_PIECE=3;

/**
 * CampoBello represents the game and all its features
 * @param gameMode game mode
 * @constructor
 */
function CampoBello(scene,gameMode) {
  CGFobject.call(this,scene);

  this.scene=scene;
  this.gameMode=gameMode;

  this.board= new Array(9);
  this.infoPlay=[];
  this.piecesPlayer1=[1,2,3,4,5,6,7,8,10,11,12,13,14,15,16,17,18];
  this.piecesPlayer2=[19,20,21,22,23,24,25,26,27,28,30,31,32,33,34,35,36];
  this.noPieces=[37,38,39,40];
  this.actualGridAreaP1=0;
  this.actualGridAreaP2=0;
  this.gridAreaPlayer1= [
   {'x':15, 'y':38.5, 'z':45},
   {'x':15, 'y':38.5, 'z':48},
   {'x':17, 'y':38.5, 'z':47},
   {'x':18, 'y':38.5, 'z':47},
   {'x':16, 'y':38.5, 'z':47},
   {'x':17, 'y':38.5, 'z':45},
   {'x':15.7, 'y':38.5, 'z':44},
   {'x':18, 'y':38.5, 'z':44},
   {'x':18, 'y':38.5, 'z':45},
   {'x':18, 'y':38.5, 'z':45},
   {'x':19, 'y':38.5, 'z':46},
   {'x':15, 'y':38.5, 'z':43},
   {'x':18, 'y':38.5, 'z':44},
   {'x':19, 'y':38.5, 'z':47},
   {'x':14, 'y':38.5, 'z':44},
   {'x':15.1, 'y':38.5, 'z':45},
   {'x':14, 'y':38.5, 'z':46},
   {'x':14, 'y':38.5, 'z':45}
 ];

 this.gridAreaPlayer2= [
   {'x':34, 'y':38.5, 'z':12.5},
 {'x':31, 'y':38.5, 'z':14},
 {'x':32, 'y':38.5, 'z':15},
 {'x':33, 'y':38.5, 'z':11},
 {'x':33.5, 'y':38.5, 'z':10},
 {'x':33, 'y':38.5, 'z':11.5},
 {'x':31, 'y':38.5, 'z':10},
 {'x':32, 'y':38.5, 'z':11},
 {'x':30, 'y':38.5, 'z':11},
 {'x':32.6, 'y':38.5, 'z':11},
 {'x':32.5, 'y':38.5, 'z':10},
 {'x':30.6, 'y':38.5, 'z':11},
 {'x':30, 'y':38.5, 'z':11.2},
 {'x':33, 'y':38.5, 'z':11.1},
 {'x':32, 'y':38.5, 'z':10.5},
 {'x':30, 'y':38.5, 'z':10.1},
 {'x':30.5, 'y':38.5, 'z':10.2},
 {'x':32, 'y':38.5, 'z':10.1}
 ];

  for(var i=0; i <9;i++){
    this.board[i]=new Array(9);
  }
  this.areas=[];
  this.areas[0]=new Area(scene,PLAYER1_ID,AREA0_ID);
  this.areas[1]=new Area(scene,PLAYER1_ID,AREA1_ID);
  this.areas[2]=new Area(scene,PLAYER2_ID,AREA2_ID);
  this.areas[3]=new Area(scene,PLAYER2_ID,AREA3_ID);

  this.state={
    INITIAL_STATE: 1,
    CHOOSE_ORIGIN:2,
    VALID_MOVEMENT:3,
    MOVEMENT_PC:4,
    REMOVE_PIECE:5,
    CHOOSE_DESTINY:6,
    ANOTHER_MOVE:7,
    WAITING_FOR_ANOTHER_BOARD:8,
    CHECK_END_GAME:9
  };

  this.currentState=this.state.INITIAL_STATE;
  this.currentStateAux;
  this.currentPlayer=PLAYER1_ID;
  this.numberOfLoops=0;
  this.actualOrigin;
  this.numberOfPiecesPlayer1=0;
  this.numberOfPiecesPlayer2=0;
  this.winner = [];
  this.game();
};

CampoBello.prototype = Object.create(CGFobject.prototype);
CampoBello.prototype.constructor = CampoBello;

/**
  * Displays areas
*/
CampoBello.prototype.display=function(){
  for(var i=0; i <= 3; i++){
  this.scene.pushMatrix();
  this.areas[i].display();
  this.scene.popMatrix();
  }

}


function getPrologRequest(requestString, onSuccess, onError, port)
{
  var requestPort = port || 8081
  var request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

  request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
  request.onerror = onError || function(){console.log("Error waiting for response");};

  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send();
}

/**
  * Receives from the prolog the initial board
  * @param  state state to return
*/
CampoBello.prototype.getInitialBoard=function(state){
  var this_t=this;
  this_t.currentState=this.state.WAITING_FOR_ANOTHER_BOARD;

  getPrologRequest('initialBoard',function(data){

    this_t.board=JSON.parse(data.target.response);
    this_t.currentState=state;
    this_t.game();

  });
}

/**
  * Check if is the end of the game. If yes, check the winner, if not continue the game
  * @param state state to return
*/
CampoBello.prototype.checkEndGame=function(state){
  console.log('currentState',this.currentState);
  var this_t=this;
  this_t.currentState=this.state.WAITING_FOR_ANOTHER_BOARD;

  getPrologRequest(
    "checkEndGame("+JSON.stringify(this_t.board)+")",
    function(data){
      var info=JSON.parse(data.target.response);
      if(info==1){
        this_t.checkWinner();
      }
      else{
        this_t.currentState=state;
        this_t.game();
      }
    });
}

/**
  * Check the winner of the game
*/
CampoBello.prototype.checkWinner=function(){
  var this_t=this;
  this_t.currentState=this.state.WAITING_FOR_ANOTHER_BOARD;

  getPrologRequest(
    "getWinner("+JSON.stringify(this_t.board)+")",
    function(data){
      var info=JSON.parse(data.target.response);

    if(data.target.response == 1)
        this_t.winner.push(1);
    else
        this_t.winner.push(2);


    });
}

/**
  * Validates the piece destination and calls the next state
*/
CampoBello.prototype.chooseDestiny=function(){
  if(this.scene.selectObjectDestiny!=0){
    this.currentState=this.state.VALID_MOVEMENT;
    this.game();
  }

}

/**
  * Check which is the area of the piece
  * @param idPiece piece id
  * @return id area
*/
CampoBello.prototype.areaPiece=function(idPiece) {
  for(var i=0; i< this.areas.length;i++){
    for(var j=1; j < this.areas[i].pieces.length;j++){
      if(this.areas[i].pieces[j].pickingId==idPiece){
        return i;
      }
    }
  }
}

/**
  * Returns the piece choosen
  * @param pickingId piece pickingId
  * @return piece
*/
CampoBello.prototype.pieceChosen=function(pickingId){

for(var i=0; i < this.areas.length;i++){
    for(var j=1; j< this.areas[i].pieces.length;j++){
      if(this.areas[i].pieces[j].pickingId==pickingId){
        var piece=this.areas[i].pieces[j];
        return piece;
      }
    }
}

for(var i=0; i < this.areas.length;i++){
    for(var j=1; j< this.areas[i].piecesInvisible.length;j++){
      if(this.areas[i].piecesInvisible[j].pickingId==pickingId){
        var piece=this.areas[i].piecesInvisible[j];
        return piece;
      }
    }
}
}

/**
  * Creates the animation of the movement of the pieces
  * @param pieceOrigin origin piece
  * @param pieceDestiny destiny piece
  * @param coordinates destiny of the piece coordinates
*/
CampoBello.prototype.createPieceAnimation=function(pieceOrigin,pieceDestiny,coordinates){
  this.currentState=this.state.UPDATE_ANIMATION;

  var cpointsOrigin=new Array();
  cpointsOrigin[0]=new Array(4);
  for(var k=0; k < 4;k++){
    cpointsOrigin[0][k]=new Array();
  }

  var x=(pieceDestiny.x-pieceOrigin.x)/2;
  var y=(pieceDestiny.y-pieceOrigin.y)/2;
  var z=(pieceDestiny.z-pieceOrigin.z)/2;

  cpointsOrigin[0][0][0]=pieceOrigin.x;
  cpointsOrigin[0][0][1]=pieceOrigin.y;
  cpointsOrigin[0][0][2]=pieceOrigin.z;
  cpointsOrigin[0][1][0]=pieceOrigin.x+x;
  cpointsOrigin[0][1][1]=40;
  cpointsOrigin[0][1][2]=pieceOrigin.z+z;
  cpointsOrigin[0][2][0]=pieceOrigin.x+(2*x);
  cpointsOrigin[0][2][1]=40;
  cpointsOrigin[0][2][2]=pieceOrigin.z+(2*z);
  cpointsOrigin[0][3][0]=pieceDestiny.x;
  cpointsOrigin[0][3][1]=pieceDestiny.y;
  cpointsOrigin[0][3][2]=pieceDestiny.z;


  var animation = new BezierAnimation(this.scene,3,cpointsOrigin,6);
  pieceOrigin.animation=animation;
  pieceOrigin.animationFinished=false;
  pieceOrigin.initial_time=0;
  pieceOrigin.delta_time=0;

  var cpointsDestiny=new Array();
  cpointsDestiny[0]=new Array(4);
  for(var k=0; k < 4;k++){
    cpointsDestiny[0][k]=new Array();
  }

if(coordinates.length!=0){
var x2=(coordinates[0].x-pieceDestiny.x)/2;
var y2=(coordinates[0].y-pieceDestiny.y)/2;
var z2=(coordinates[0].z-pieceDestiny.z)/2;

cpointsDestiny[0][0][0]=pieceDestiny.x;
cpointsDestiny[0][0][1]=pieceDestiny.y;
cpointsDestiny[0][0][2]=pieceDestiny.z;

cpointsDestiny[0][1][0]=pieceDestiny.x+x2;
cpointsDestiny[0][1][1]=40;
cpointsDestiny[0][1][2]=pieceDestiny.z+z2;

cpointsDestiny[0][2][0]=pieceDestiny.x+(2*x2);
cpointsDestiny[0][2][1]=40;
cpointsDestiny[0][2][2]=pieceDestiny.z+(2*z2);

cpointsDestiny[0][3][0]=coordinates[0].x;
cpointsDestiny[0][3][1]=coordinates[0].y;
cpointsDestiny[0][3][2]=coordinates[0].z;

var animation = new LinearAnimation(this.scene,3,cpointsDestiny,6);
pieceDestiny.animation=animation;
pieceDestiny.animationFinished=false;
pieceDestiny.initial_time=0;
pieceDestiny.delta_time=0;
}
}

/**
  * Creates the undo animation
  * @param piecesUndo last play information
*/
CampoBello.prototype.undoMove=function(piecesUndo){
  console.log('piecesUndo',piecesUndo[0].pickingIdOrigin);
  this.board=piecesUndo[0].lastBoard;
  if(piecesUndo.length>1){
      var pieceOrigin= this.pieceChosen(piecesUndo[0].pickingIdOrigin);
      console.log('PieceOrigin',pieceOrigin);
      var cpointsOrigin=new Array();
      cpointsOrigin[0]=new Array(4);
      for(var k=0; k < 4;k++){
        cpointsOrigin[0][k]=new Array();
      }

      var x=(piecesUndo[1].coordinatesOriginX-piecesUndo[1].NewCoordinatesOriginX)/3;
      var y=(piecesUndo[1].coordinatesOriginY-piecesUndo[1].NewCoordinatesOriginY)/3;
      var z=(piecesUndo[1].coordinatesOriginZ-piecesUndo[1].NewCoordinatesOriginZ)/3;

      cpointsOrigin[0][0][0]=piecesUndo[1].NewCoordinatesOriginX;
      cpointsOrigin[0][0][1]=piecesUndo[1].NewCoordinatesOriginY;
      cpointsOrigin[0][0][2]=piecesUndo[1].NewCoordinatesOriginZ;

      cpointsOrigin[0][1][0]=piecesUndo[1].NewCoordinatesOriginX+x;
      cpointsOrigin[0][1][1]=40;
      cpointsOrigin[0][1][2]=piecesUndo[1].NewCoordinatesOriginZ+z;

      cpointsOrigin[0][2][0]=piecesUndo[1].NewCoordinatesOriginX+(2*x);
      cpointsOrigin[0][2][1]=40;
      cpointsOrigin[0][2][2]=piecesUndo[1].NewCoordinatesOriginZ+(2*z);

      cpointsOrigin[0][3][0]=piecesUndo[1].coordinatesOriginX;
      cpointsOrigin[0][3][1]=piecesUndo[1].coordinatesOriginY;
      cpointsOrigin[0][3][2]=piecesUndo[1].coordinatesOriginZ;

      var animation = new BezierAnimation(this.scene,3,cpointsOrigin,6);

      pieceOrigin.animation=animation;
      pieceOrigin.animationFinished=false;
      pieceOrigin.initial_time=0;
      pieceOrigin.delta_time=0;
  }
  else{
  var pieceOrigin= this.pieceChosen(piecesUndo[0].pickingIdOrigin);
  var pieceDestiny=this.pieceChosen(piecesUndo[0].pickingIdDestiny);

  var cpointsOrigin=new Array();
  cpointsOrigin[0]=new Array(4);
  for(var k=0; k < 4;k++){
    cpointsOrigin[0][k]=new Array();
  }

  var x=(piecesUndo[0].coordinatesOriginX-piecesUndo[0].NewCoordinatesOriginX)/3;
  var y=(piecesUndo[0].coordinatesOriginY-piecesUndo[0].NewCoordinatesOriginY)/3;
  var z=(piecesUndo[0].coordinatesOriginZ-piecesUndo[0].NewCoordinatesOriginZ)/3;

  cpointsOrigin[0][0][0]=piecesUndo[0].NewCoordinatesOriginX;
  cpointsOrigin[0][0][1]=piecesUndo[0].NewCoordinatesOriginY;
  cpointsOrigin[0][0][2]=piecesUndo[0].NewCoordinatesOriginZ;

  cpointsOrigin[0][1][0]=piecesUndo[0].NewCoordinatesOriginX+x;
  cpointsOrigin[0][1][1]=40;
  cpointsOrigin[0][1][2]=piecesUndo[0].NewCoordinatesOriginZ+z;

  cpointsOrigin[0][2][0]=piecesUndo[0].NewCoordinatesOriginX+(2*x);
  cpointsOrigin[0][2][1]=40;
  cpointsOrigin[0][2][2]=piecesUndo[0].NewCoordinatesOriginZ+(2*z);

  cpointsOrigin[0][3][0]=piecesUndo[0].coordinatesOriginX;
  cpointsOrigin[0][3][1]=piecesUndo[0].coordinatesOriginY;
  cpointsOrigin[0][3][2]=piecesUndo[0].coordinatesOriginZ;

  var animation = new BezierAnimation(this.scene,3,cpointsOrigin,6);

  pieceDestiny.animation=animation;
  pieceDestiny.animationFinished=false;
  pieceDestiny.initial_time=0;
  pieceDestiny.delta_time=0;

if(pieceDestiny.typeOfPiece!=NO_PIECE){
  var cpointsDestiny=new Array();
  cpointsDestiny[0]=new Array(4);
  for(var k=0; k < 4;k++){
    cpointsDestiny[0][k]=new Array();
  }


var x2=(piecesUndo[0].coordinatesDestinyX-piecesUndo[0].NewCoordinatesDestinyX)/3;
var y2=(piecesUndo[0].coordinatesDestinyY-piecesUndo[0].NewCoordinatesDestinyY)/3;
var z2=(piecesUndo[0].coordinatesDestinyZ-piecesUndo[0].NewCoordinatesDestinyZ)/3;

cpointsDestiny[0][0][0]=piecesUndo[0].NewCoordinatesDestinyX;
cpointsDestiny[0][0][1]=piecesUndo[0].NewCoordinatesDestinyY;
cpointsDestiny[0][0][2]=piecesUndo[0].NewCoordinatesDestinyZ;

cpointsDestiny[0][1][0]=piecesUndo[0].NewCoordinatesDestinyX+(x2);
cpointsDestiny[0][1][1]=40;
cpointsDestiny[0][1][2]=piecesUndo[0].NewCoordinatesDestinyZ+(z2);

cpointsDestiny[0][2][0]=piecesUndo[0].NewCoordinatesDestinyX+(2*x2);
cpointsDestiny[0][2][1]=40;
cpointsDestiny[0][2][2]=piecesUndo[0].NewCoordinatesDestinyZ+(2*z2);

cpointsDestiny[0][3][0]=piecesUndo[0].coordinatesDestinyX;
cpointsDestiny[0][3][1]=piecesUndo[0].coordinatesDestinyY;
cpointsDestiny[0][3][2]=piecesUndo[0].coordinatesDestinyZ;


var animation = new LinearAnimation(this.scene,3,cpointsDestiny,6);
pieceOrigin.animation=animation;
pieceOrigin.animationFinished=false;
pieceOrigin.initial_time=0;
pieceOrigin.delta_time=0;
}

this.resetCoordinates(pieceOrigin,pieceDestiny,piecesUndo);
console.log('origin',pieceOrigin,pieceDestiny);
}


}

/**
  * Choose a piece to remove
*/
CampoBello.prototype.choosePieceToRemove=function(){
  var this_t=this;

  getPrologRequest(
    "removePiece("+JSON.stringify(this_t.board)+","+
    JSON.stringify(this_t.scene.pieceToRemove)+","+
    JSON.stringify(this_t.currentPlayer)+")",
    function(data){
      info=JSON.parse(data.target.response);

      if(info.length!=0){

        this_t.board=info;
        var piece=this_t.pieceChosen(this_t.scene.pieceToRemove);

        if(this_t.currentPlayer==PLAYER1_ID){
        var coordinates=[
          {'x':this_t.gridAreaPlayer1[this_t.actualGridAreaP1].x,
          'y':this_t.gridAreaPlayer1[this_t.actualGridAreaP1].y,
          'z':this_t.gridAreaPlayer1[this_t.actualGridAreaP1].z}
        ];
        this_t.actualGridAreaP1++;
        }
        else {
          var coordinates=[
            {'x':this_t.gridAreaPlayer2[this_t.actualGridAreaP2].x,
            'y':this_t.gridAreaPlayer2[this_t.actualGridAreaP2].y,
            'z':this_t.gridAreaPlayer2[this_t.actualGridAreaP2].z}
          ];
          this_t.actualGridAreaP2++;
          }

        var cpointsDestiny=new Array();
        cpointsDestiny[0]=new Array(4);
        for(var k=0; k < 4;k++){
          cpointsDestiny[0][k]=new Array();
        }

      var x2=(coordinates[0].x-piece.x)/2;
      var y2=(coordinates[0].y-piece.y)/2;
      var z2=(coordinates[0].z-piece.z)/2;

      cpointsDestiny[0][0][0]=piece.x;
      cpointsDestiny[0][0][1]=piece.y;
      cpointsDestiny[0][0][2]=piece.z;

      cpointsDestiny[0][1][0]=piece.x+x2;
      cpointsDestiny[0][1][1]=piece.y+(2*y2);
      cpointsDestiny[0][1][2]=piece.z+z2;

      cpointsDestiny[0][2][0]=piece.x+(2*x2);
      cpointsDestiny[0][2][1]=piece.y+(3*y2);
      cpointsDestiny[0][2][2]=piece.z+(2*z2);

      cpointsDestiny[0][3][0]=coordinates[0].x;
      cpointsDestiny[0][3][1]=coordinates[0].y;
      cpointsDestiny[0][3][2]=coordinates[0].z;

      var animation = new LinearAnimation(this.scene,3,cpointsDestiny,6);
      piece.animation=animation;
      piece.animationFinished=false;
      piece.initial_time=0;
      piece.delta_time=0;

      this_t.switchPlayer();
      this_t.currentState=this_t.state.CHECK_END_GAME;


      this_t.addInfo(piece,1,coordinates);
      }

      this_t.game();
    });
}

/**
  * Pc choose a piece to remove
*/
CampoBello.prototype.choosePieceToRemovePC=function(){
  var this_t=this;

  getPrologRequest(
    "pcRemovePiece("+JSON.stringify(this_t.board)+","+
    JSON.stringify(this_t.currentPlayer)+")",
    function(data){
      var info=JSON.parse(data.target.response);
      if(info.length!=0){
      this_t.board=info[1];

      var piece=this_t.pieceChosen(info[0]);

      if(this_t.currentPlayer==PLAYER1_ID){
      var coordinates=[
        {'x':this_t.gridAreaPlayer1[this_t.actualGridAreaP1].x,
        'y':this_t.gridAreaPlayer1[this_t.actualGridAreaP1].y,
        'z':this_t.gridAreaPlayer1[this_t.actualGridAreaP1].z}
      ];
      this_t.actualGridAreaP1++;
      }
      else {
        var coordinates=[
          {'x':this_t.gridAreaPlayer2[this_t.actualGridAreaP2].x,
          'y':this_t.gridAreaPlayer2[this_t.actualGridAreaP2].y,
          'z':this_t.gridAreaPlayer2[this_t.actualGridAreaP2].z}
        ];
        this_t.actualGridAreaP2++;
        }

      var cpointsDestiny=new Array();
      cpointsDestiny[0]=new Array(4);
      for(var k=0; k < 4;k++){
        cpointsDestiny[0][k]=new Array();
      }

    var x2=(coordinates[0].x-piece.x)/2;
    var y2=(coordinates[0].y-piece.y)/2;
    var z2=(coordinates[0].z-piece.z)/2;

    cpointsDestiny[0][0][0]=piece.x;
    cpointsDestiny[0][0][1]=piece.y;
    cpointsDestiny[0][0][2]=piece.z;

    cpointsDestiny[0][1][0]=piece.x+x2;
    cpointsDestiny[0][1][1]=piece.y+(2*y2);
    cpointsDestiny[0][1][2]=piece.z+z2;

    cpointsDestiny[0][2][0]=piece.x+(2*x2);
    cpointsDestiny[0][2][1]=piece.y+(3*y2);
    cpointsDestiny[0][2][2]=piece.z+(2*z2);

    cpointsDestiny[0][3][0]=coordinates[0].x;
    cpointsDestiny[0][3][1]=coordinates[0].y;
    cpointsDestiny[0][3][2]=coordinates[0].z;

    var animation = new LinearAnimation(this.scene,3,cpointsDestiny,6);
    piece.animation=animation;
    piece.animationFinished=false;

    piece.x=coordinates[0].x;
    piece.y=coordinates[0].y;
    piece.z=coordinates[0].z;

    this_t.addInfo(piece,1,coordinates);
  }
  this_t.switchPlayer();
  this_t.currentState=this_t.state.CHECK_END_GAME;
  this_t.game();
    });
}

function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

/**
  * Pc choose the movement of the pieces
*/
CampoBello.prototype.movementPC=function(){
    var this_t=this;
    var state;

    getPrologRequest(
      "pcMove("+JSON.stringify(this_t.board)+","+
      JSON.stringify(this_t.currentPlayer)+")",
      function(data){
        var info=JSON.parse(data.target.response);

        if(info.length!=0){
        this_t.board=info[0];

        var pieceOrigin= this_t.pieceChosen(info[2]);
        var pieceDestiny=this_t.pieceChosen(info[1]);

        state=this_t.gameCycle(pieceOrigin,pieceDestiny);
      }
      else{
        this_t.switchPlayer();
        if(this_t.gameMode==XMLscene.gameMode.PC_VS_PC)
          state=this_t.state.MOVEMENT_PC;
        else {
          state=this_t.state.CHOOSE_ORIGIN;
        }
      }

//      pausecomp(150);
      this_t.currentState=state;
      this_t.game();

      });

}

/**
  * Pc choose the piece destination
*/
CampoBello.prototype.pcDoubleMove=function(){
    var this_t=this;
    var origin= this_t.actualOrigin.getPickingID();

    getPrologRequest(
      "pcDoubleMove("+JSON.stringify(this_t.board)+","+
      JSON.stringify(this_t.currentPlayer)+ "," + JSON.stringify(origin)+")",
      function(data){
          var info= JSON.parse(data.target.response);

          if(info.length!=0){
              this_t.board=info[0];

              var pieceDestiny=this_t.pieceChosen(info[1]);
              this_t.currentState=this_t.gameCycle(this_t.actualOrigin,pieceDestiny);
          }
          else{

            this_t.switchPlayer();
            this_t.currentState=this_t.state.CHECK_END_GAME;
}
            this_t.game();
      });


}

/**
  * Game cycle
  * @param pieceOrigin origin piece
  * @param pieceDestiny destiny piece
  * @return the next state
*/
CampoBello.prototype.gameCycle=function(pieceOrigin,pieceDestiny){
var stateToReturn;

  if(pieceOrigin.typeOfPiece==pieceDestiny.typeOfPiece){
    if(this.currentPlayer==PLAYER1_ID){
      this.numberOfPiecesPlayer1++;
    var coordinates=[
      {'x':this.gridAreaPlayer1[this.actualGridAreaP1].x,
      'y':this.gridAreaPlayer1[this.actualGridAreaP1].y,
      'z':this.gridAreaPlayer1[this.actualGridAreaP1].z}
    ];
    this.actualGridAreaP1++;
    }
    else {
      this.numberOfPiecesPlayer2++;
      var coordinates=[
        {'x':this.gridAreaPlayer2[this.actualGridAreaP2].x,
        'y':this.gridAreaPlayer2[this.actualGridAreaP2].y,
        'z':this.gridAreaPlayer2[this.actualGridAreaP2].z}
      ];
      this.actualGridAreaP2++;
      }

      this.switchPlayer();
      stateToReturn=this.state.CHECK_END_GAME;
    }
    else if(pieceDestiny.typeOfPiece==NO_PIECE){
      var coordinates=[];
      if(this.numberOfLoops!=3){
        this.numberOfLoops++;

        this.actualOrigin=pieceOrigin;

        stateToReturn=this.state.ANOTHER_MOVE;
      }
      else{
        this.numberOfLoops=0;
        this.switchPlayer();
        stateToReturn=this.state.CHECK_END_GAME;
      }

    }
    else{

      if(this.currentPlayer==PLAYER2_ID){
      this.numberOfPiecesPlayer1++;
      var coordinates=[
        {'x':this.gridAreaPlayer1[this.actualGridAreaP1].x,
        'y':this.gridAreaPlayer1[this.actualGridAreaP1].y,
        'z':this.gridAreaPlayer1[this.actualGridAreaP1].z}
      ];
      this.actualGridAreaP1++;
      }
      else {
        this.numberOfPiecesPlayer2++;
        var coordinates=[
          {'x':this.gridAreaPlayer2[this.actualGridAreaP2].x,
          'y':this.gridAreaPlayer2[this.actualGridAreaP2].y,
          'z':this.gridAreaPlayer2[this.actualGridAreaP2].z}
        ];
        this.actualGridAreaP2++;
        }

        stateToReturn=this.state.REMOVE_PIECE;
      }

      this.createPieceAnimation(pieceOrigin,pieceDestiny,coordinates);

      this.addInfo(pieceOrigin,pieceDestiny,coordinates);

      this.setCoordinates(pieceOrigin,pieceDestiny,coordinates);
      return stateToReturn;
}

/**
  * Set coordinates of the piece and the pickingId
  * @param origin origin piece
  * @param destiny destiny piece
  * @param coordinates destiny piece coordinates
*/
CampoBello.prototype.setCoordinates=function(origin,destiny,coordinates){

  origin.x=destiny.x;
  origin.y=destiny.y;
  origin.z=destiny.z;
  if(coordinates.length!=0){
  destiny.x=coordinates[0].x;
  destiny.y=coordinates[0].y;
  destiny.z=coordinates[0].z;
  }
  var originPickingID= origin.pickingId;
  origin.setPickingID(destiny.pickingId);

  if(destiny.typeOfPiece!=NO_PIECE)
  destiny.setPickingID(originPickingID);

}

/**
  * Reset coordinates of the piece and the pickResults
  * @param origin origin piece
  * @param destiny destiny piece
  * @param coordinates destiny piece coordinates
*/
CampoBello.prototype.resetCoordinates=function(origin,destiny,piecesUndo){
  if(piecesUndo.length==1){

  origin.x=piecesUndo[0].coordinatesOriginX;
  origin.y=piecesUndo[0].coordinatesOriginY;
  origin.z=piecesUndo[0].coordinatesOriginZ;
  destiny.x=piecesUndo[0].coordinatesDestinyX;
  destiny.y=piecesUndo[0].coordinatesDestinyY;
  destiny.z=piecesUndo[0].coordinatesDestinyZ;


  origin.setPickingID(piecesUndo[0].pickingIdDestiny);
  if(destiny.typeOfPiece!=NO_PIECE)
  destiny.setPickingID(piecesUndo[0].pickingIdOrigin);
  }
}

/**
  * Adds the information of the plays
  * @param origin origin piece
  * @param destiny destiny piece
  * @param coordinates destiny piece coordinates
*/
CampoBello.prototype.addInfo=function(origin,destiny,coordinates){

  if(destiny==1){
      var addInfo=[
        {'pickingIdOrigin': origin.getPickingID(),
          'lastBoard':this.board},
        { 'coordinatesOriginX':origin.x,
         'coordinatesOriginY':origin.y,
         'coordinatesOriginZ':origin.z,
         'NewCoordinatesOriginX':coordinates[0].x,
         'NewCoordinatesOriginY':coordinates[0].y,
         'NewCoordinatesOriginZ':coordinates[0].z}
      ];
  }
  else{
  if(coordinates.length!=0){
  var addInfo=[
    {'pickingIdOrigin':origin.getPickingID(),
   'coordinatesOriginX':origin.x,
   'coordinatesOriginY':origin.y,
   'coordinatesOriginZ':origin.z,
   'coordinatesDestinyX':destiny.x,
   'coordinatesDestinyY':destiny.y,
   'coordinatesDestinyZ':destiny.z,
   'NewCoordinatesOriginX':destiny.x,
   'NewCoordinatesOriginY':destiny.y,
   'NewCoordinatesOriginZ':destiny.z,
   'NewCoordinatesDestinyX':coordinates[0].x,
   'NewCoordinatesDestinyY':coordinates[0].y,
   'NewCoordinatesDestinyZ':coordinates[0].z,
   'pickingIdDestiny':destiny.getPickingID(),
   'lastBoard':this.board}
  ];
}
else{
  var addInfo=[
    {'pickingIdOrigin':origin.getPickingID(),
   'coordinatesOriginX':origin.x,
   'coordinatesOriginY':origin.y,
   'coordinatesOriginZ':origin.z,
   'coordinatesDestinyX':destiny.x,
   'coordinatesDestinyY':destiny.y,
   'coordinatesDestinyZ':destiny.z,
   'NewCoordinatesOriginX':destiny.x,
   'NewCoordinatesOriginY':destiny.y,
   'NewCoordinatesOriginZ':destiny.z,
   'NewCoordinatesDestinyX':destiny.x,
   'NewCoordinatesDestinyY':destiny.y,
   'NewCoordinatesDestinyZ':destiny.z,
   'pickingIdDestiny':destiny.getPickingID(),
   'lastBoard':this.board}
  ];
}
}
  this.infoPlay.push(addInfo);
}

/**
  * Switch the player and the camara
*/
CampoBello.prototype.switchPlayer=function(){
    this.scene.animcam.animationCameraFinished=false;
    this.scene.marker.initialTime=0;
    this.scene.marker.deltaTime=0;

  if(this.currentPlayer==PLAYER1_ID){
      this.currentPlayer=PLAYER2_ID;

      this.scene.animcam.setFinalPoint(vec3.fromValues(12, 11.5, 7));
    }

  else{
    this.currentPlayer=PLAYER1_ID;
      this.scene.animcam.setFinalPoint(vec3.fromValues(5, 10, 14));
  }

  if(this.currentState == this.state.ANOTHER_MOVE || this.currentState == this.state.REMOVE_PIECE){
    this.currentState=this.state.CHECK_END_GAME;
    this.game();
  }

  console.log('Its your turn player',this.currentPlayer);
  console.log('Choose your pieces!');

}

/**
  * Verify if the move is valid
  * @param pieceOrigin origin piece
  * @param pieceDestiny destiny piece
*/
CampoBello.prototype.validateMove=function(pieceOrigin,pieceDestiny){
  var this_t=this;
  var areaOriginPiece=this_t.areaPiece(pieceOrigin.pickingId);
  var state;

  var idDestiny=pieceDestiny.pickingId;

  getPrologRequest(
    "validateGame("+JSON.stringify(this_t.board)+","+
    JSON.stringify(pieceOrigin.pickingId)+","+
    JSON.stringify(idDestiny)+","+
    JSON.stringify(areaOriginPiece)+")",
    function(data){
      var info=JSON.parse(data.target.response);
      if(info.length!=0){
        this_t.board=info;
          state=this_t.gameCycle(pieceOrigin,pieceDestiny);

        }

          this_t.scene.selectObjectOrigin=0;
          this_t.scene.selectObjectDestiny=0;

          this_t.currentState=state;
          this_t.game();

    });
  }

/**
  * Game movie
*/
CampoBello.prototype.viewMovie = function(){
  for(var i = 0; i < this.infoPlay.length; i++)
    this.undoMove(this.infoPlay[i]);

}
/**
  * Game state machine
*/
CampoBello.prototype.game = function(){
  switch (this.currentState) {
    case this.state.INITIAL_STATE:
    console.log('Welcome!');
    if(this.gameMode==XMLscene.gameMode.PLAYER_VS_PLAYER || this.gameMode==XMLscene.gameMode.PC_VS_PLAYER){
    this.getInitialBoard(this.state.CHOOSE_ORIGIN);
    this.game();
  }
    else if(this.gameMode==XMLscene.gameMode.PC_VS_PC){
    this.getInitialBoard(this.state.MOVEMENT_PC);

    this.game();
  }
    break;
    case this.state.CHOOSE_ORIGIN:
    break;
    case this.state.CHOOSE_DESTINY:
    break;
    case this.state.VALID_MOVEMENT:
    var pieceOrigin= this.pieceChosen(this.scene.selectObjectOrigin);
    var pieceDestiny=this.pieceChosen(this.scene.selectObjectDestiny);
    this.validateMove(pieceOrigin,pieceDestiny);
    break;
    case this.state.MOVEMENT_PC:
    this.movementPC();
    break;
    case this.state.REMOVE_PIECE:
    console.log('Choose a piece to remove!');
    if(this.gameMode==XMLscene.gameMode.PC_VS_PC){
      this.choosePieceToRemovePC();
    }
    else if(this.gameMode==XMLscene.gameMode.PC_VS_PLAYER){
      if(this.currentPlayer==PLAYER2_ID)
        this.choosePieceToRemovePC();
    }
      break;
    case this.state.ANOTHER_MOVE:
    console.log('actualPlayer',this.actualPlayer);
    console.log('Choose another destiny!');
    if(this.gameMode==XMLscene.gameMode.PC_VS_PC){
        this.pcDoubleMove();
    }
    else if(this.gameMode==XMLscene.gameMode.PC_VS_PLAYER){
      if(this.currentPlayer==PLAYER2_ID){
        this.pcDoubleMove();
      }
    }
    break;
    case this.state.CHECK_END_GAME:
    if(this.gameMode==XMLscene.gameMode.PLAYER_VS_PLAYER){
      this.checkEndGame(this.state.CHOOSE_ORIGIN);
    }
    else if(this.gameMode==XMLscene.gameMode.PC_VS_PC){
      this.checkEndGame(this.state.MOVEMENT_PC);
    }
    else{
      if(this.currentPlayer==PLAYER2_ID){
        this.checkEndGame(this.state.MOVEMENT_PC);
      }
      else{
        this.checkEndGame(this.state.CHOOSE_ORIGIN);
      }
    }
    break;
    default:
  }
}
