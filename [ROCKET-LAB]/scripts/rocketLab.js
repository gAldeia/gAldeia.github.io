//rocketLab.js


//VARIÁVEIS GLOBAIS-------------------------------------------------------------
var canvas;
var ctx;
var animation;


//FOGUETUINHO-------------------------------------------------------------------
var rocket = function(sizeX, sizeY, sizeZ){

    //classe que rotaciona pontos 3d internamente, um tipo de "herança"
    //feita na força da gambiarra
    var Model3DManager = function(points){
        
        return{
            rotateX : function (theta){
                //funçao que rotaciona todos os pontos em torno do eixo X;
            
                var cos = Math.cos(theta);
                var sin = Math.sin(theta);
            
                for (var i=0; i<points.length; i++){
                    nodeY = points[i][1];
                    nodeZ = points[i][2];
            
                    points[i][1] = (cos*nodeY) - (sin*nodeZ);
                    points[i][2] = (cos*nodeZ) + (sin*nodeY);
                }
            },
            
            rotateY : function(theta){
                //funçao que rotaciona todos os pontos em torno do eixo Y;
            
                var cos = Math.cos(theta);
                var sin = Math.sin(theta);
        
                for (var i=0; i<points.length; i++){
                    nodeX = points[i][0];
                    nodeZ = points[i][2];
            
                    points[i][0] = (cos*nodeX) - (sin*nodeZ);
                    points[i][2] = (cos*nodeZ) + (sin*nodeX);
                }
            },
            
            rotateZ : function(theta){
                //funçao que rotaciona todos os pontos em torno do eixo Z;
            
                var cos = Math.cos(theta);
                var sin = Math.sin(theta);
            
                for (var i=0; i<points.length; i++){
                    nodeX = points[i][0];
                    nodeY = points[i][1];
            
                    points[i][0] = (cos*nodeX) - (sin*nodeY);
                    points[i][1] = (cos*nodeY) + (sin*nodeX);
                }
            }
        }
    }    

    var rocketBody = function(sizeXZ, sizeY){

        //OBS: para mudar a quantidade de poligonos do foguete voce ira ter
        //um trampo demoniaco, então recomendo NÃO MUDAR. se o pc não aguentar,
        //SÓ CHORA, NENE.

        var points = [ ];
        var rotate = new Model3DManager(points);

        //fazer um cilindro com pontos (lembrando que y cresce de cima para
        //baixo)
        for(var i=0; i<2; i++){

            //sempre jogar 1 ponto a mais do que será plotado
            for(var j=0; j<20; j++){
                aux = [sizeXZ, i==0? sizeY : -sizeY, sizeXZ];
                rotate.rotateY(6.283/20, points);
                points.push(aux);
            }
        }
        //ponto para ser o bico da coifa do foguete
        points.push([0, sizeY*1.55, 0]);

        return {
            rotateX : function(theta){
                rotate.rotateX(theta);
            },
            rotateY : function(theta){
                rotate.rotateY(theta);
            },
            rotateZ : function(theta){
                rotate.rotateZ(theta);
            },
            draw : function(){
                //desenha o cilindro de cor laranja (transparente).
                ctx.fillStyle = '#cc8d06';

                //desenha todos os retangulos com excessao do ultimo
                for (var i=0; i<19; i++){
                    ctx.beginPath();
                    ctx.moveTo(points[i+1][0], points[i+1][1]);
                    ctx.lineTo(points[i][0], points[i][1]);
                    ctx.lineTo(points[i+20][0], points[i+20][1]);
                    ctx.lineTo(points[i+1+20][0], points[i+1+20][1]);
                    ctx.closePath();
                    //ctx.stroke();
                    ctx.fill();
                }
                //finaliza o desenho com o último retangulo (a separação é
                //feita pq é preciso ligar o ultimo ponto ao primeiro, e para
                //evitar verificação dentro do for (aumentando tempo de pro-
                //cessamento), o ultimo é feito do lado de fora, evitando 20
                //comparações)
                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                ctx.lineTo(points[19][0], points[19][1]);
                ctx.lineTo(points[39][0], points[39][1]);
                ctx.lineTo(points[20][0], points[20][1]);
                ctx.closePath();
                //ctx.stroke();
                ctx.fill();

                //desenha a coifa
                ctx.fillStyle = '#000000';

                for (var i=0; i<20-1; i++){
                    ctx.beginPath();
                    ctx.moveTo(points[i][0], points[i][1]);
                    ctx.lineTo(points[40][0], points[40][1]);
                    ctx.lineTo(points[i+1][0], points[i+1][1]);
                    ctx.closePath();
                    //ctx.stroke();
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                ctx.lineTo(points[40][0], points[40][1]);
                ctx.lineTo(points[19][0], points[19][1]);
                ctx.closePath();
                //ctx.stroke();
                ctx.fill();
            }
        }
    }

    var rocketFins = function(sizeXZ, sizeY){

        var points = [ ];
        var rotate = new Model3DManager(points);

        for(var i=0; i<3; i++){
            
            //sempre jogar 1 ponto a mais do que será plotado
            points.push([sizeXZ, -sizeY*0.55, sizeXZ]);
            points.push([sizeXZ, -sizeY*0.85, sizeXZ]);
            points.push([sizeXZ*4, -sizeY*1.25, sizeXZ*4]);
            rotate.rotateY(6.283/3, points);
        }

        return {
            rotateX : function(theta){
                rotate.rotateX(theta);
            },
            rotateY : function(theta){
                rotate.rotateY(theta);
            },
            rotateZ : function(theta){
                rotate.rotateZ(theta);
            },
            draw : function(){

                ctx.fillStyle = '#000000';

                for (var i=0; i<3; i++){
                    ctx.beginPath();
                    ctx.moveTo(points[i*3][0], points[i*3][1]);
                    ctx.lineTo(points[(i*3)+1][0], points[(i*3)+1][1]);
                    ctx.lineTo(points[(i*3)+2][0], points[(i*3)+2][1]);
                    ctx.lineTo(points[i*3][0], points[i*3][1]);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                }
            }
        }
    }

    //guardar o modelo
    var rocketModel = [];    
    rocketModel.push(new rocketBody(sizeX, sizeY));
    rocketModel.push(new rocketFins(sizeX, sizeY));

    return {
        draw : function(){
            for (var i=0; i<rocketModel.length; i++){
                rocketModel[i].draw();
            }
        },
        rotate : function(xDeg, yDeg, zDeg){
            for (var i=0; i<rocketModel.length; i++){
                rocketModel[i].rotateX(xDeg);
                rocketModel[i].rotateY(yDeg);
                rocketModel[i].rotateZ(zDeg);
            }
        }
    }
}


//CONTROLE DE ANIMAÇÃO----------------------------------------------------------
function rotate_animation(boitata){
	//função que gera a animação de rotação.
    ctx.clearRect(-ctx.canvas.width/2, -ctx.canvas.height/2, ctx.canvas.width, ctx.canvas.height);
    
    var aux;

    if (lines.length>0){
        aux = lines[0];
        lines.pop();
    }
    else{
        aux = [0, 0, 0];

        ctx.font = '60pt Calibri';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText('END OF INPUT', 0, 0);
    }

    boitata.rotate(aux[0], aux[1], aux[2]);
    boitata.draw();
}

function noData_animation(boitata){
    ctx.clearRect(-ctx.canvas.width/2, -ctx.canvas.height/2, ctx.canvas.width, ctx.canvas.height);
    
    boitata.rotate(-0.005, -0.005, -0.005);
    boitata.draw();

    ctx.font = '60pt Calibri';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('NO DATA FOUND', 0, 0);
}


//"MAIN"------------------------------------------------------------------------
function setup(){
    canvas = document.getElementById("canvas");

    //configurando o canvas
	ctx = canvas.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.globalAlpha = 0.6;
    ctx.translate(ctx.canvas.width/2,ctx.canvas.height/2);

    var boitata = new rocket(15, 200, 15);

    clearInterval(animation);

    if (lines.length==0){
        animation = setInterval(function(){
            noData_animation(boitata);
        }, 10);
    }
    else {
        animation = setInterval(function(){
            rotate_animation(boitata);
        }, 20);
    }
}