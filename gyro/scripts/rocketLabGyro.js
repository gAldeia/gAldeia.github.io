//rocketLabGyro.js
//extensão do gyro


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

    //corpo do boitatá
    var rocketBody = function(sizeXZ, sizeY){
        
        //MÁGICA. NÃO TOQUE. NÃO OLHE. NÃO TENTE ENTENDER

        var points = [ ];
        var rotate = new Model3DManager(points);
        var pl = 16; //numero de poligonos

        //fazer um cilindro com pontos (lembrando que y cresce de cima para
        //baixo)
        for(var i=0; i<(pl/2)+1; i++){
            points.push([sizeXZ, -sizeY, sizeXZ]);
            points.push([sizeXZ, sizeY, sizeXZ]);
            rotate.rotateY((6.283/pl)*2, points);
        }
        //ponto para ser o bico da coifa do foguete
        points.push([0, sizeY*1.45, 0]);

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
                
                var fov = 750;
                
                //desenha todos os retangulos
                for (var i=0; i<pl-1; i=i+2){
                    ctx.fillStyle = '#cc8d06'; //fov/(fov+points[i][2]);
                    ctx.beginPath();
                    ctx.moveTo(points[i][0]*fov/(fov+points[i][2]), points[i][1]*fov/(fov+points[i][2]));
                    ctx.lineTo(points[i+1][0]*fov/(fov+points[i+1][2]), points[i+1][1]*fov/(fov+points[i+1][2]));
                    ctx.lineTo(points[i+3][0]*fov/(fov+points[i+3][2]), points[i+3][1]*fov/(fov+points[i+3][2]));
                    ctx.lineTo(points[i+2][0]*fov/(fov+points[i+2][2]), points[i+2][1]*fov/(fov+points[i+2][2]));
                    ctx.closePath();
                    ctx.fill();
                }
                for(var i=0; i<pl-1; i=i+2){ //coifa
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.moveTo(points[i+1][0]*fov/(fov+points[i+1][2]), points[i+1][1]*fov/(fov+points[i+1][2]));
                    ctx.lineTo(points[points.length-1][0]*fov/(fov+points[points.length-1][2]), points[points.length-1][1]*fov/(fov+points[points.length-1][2]));
                    ctx.lineTo(points[i+3][0]*fov/(fov+points[i+3][2]), points[i+3][1]*fov/(fov+points[i+3][2]));
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }

    var rocketFins = function(sizeXZ, sizeY){

        var points = [ ];
        var rotate = new Model3DManager(points);
        var nOf = 4; //numero de empenas

        for(var i=0; i<nOf; i++){
            
            //sempre jogar 1 ponto a mais do que será plotado
            points.push([sizeXZ, -sizeY*0.65, sizeXZ]);
            points.push([sizeXZ, -sizeY*0.95, sizeXZ]);
            points.push([sizeXZ*3, -sizeY*0.9, sizeXZ*3]);
            points.push([sizeXZ*3, -sizeY*0.75, sizeXZ*3]);
            rotate.rotateY(6.283/nOf, points);
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

				//FOV
				var fov = 750;
			
                ctx.fillStyle = '#000000';

                for (var i=0; i<nOf; i++){
                    ctx.beginPath();
                    ctx.moveTo(points[i*nOf][0]*fov/(fov+points[i*nOf][2]), points[i*nOf][1]*fov/(fov+points[i*nOf][2]));
                    ctx.lineTo(points[(i*nOf)+1][0]*fov/(fov+points[(i*nOf)+1][2]), points[(i*nOf)+1][1]*fov/(fov+points[(i*nOf)+1][2]));
                    ctx.lineTo(points[(i*nOf)+2][0]*fov/(fov+points[(i*nOf)+2][2]), points[(i*nOf)+2][1]*fov/(fov+points[(i*nOf)+2][2]));
                    ctx.lineTo(points[(i*nOf)+3][0]*fov/(fov+points[(i*nOf)+3][2]), points[(i*nOf)+3][1]*fov/(fov+points[(i*nOf)+3][2]));
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                }
            }
        }
    }

    //guardar o modelo
    var rocketModel = [
        new rocketBody(sizeX, sizeY),
        new rocketFins(sizeX, sizeY)
    ];

    return {
        draw : function(){
            for (var i=0; i<rocketModel.length; i++){
                rocketModel[i].draw(); //desenha cada componente
            }
        },
        rotate : function(xRad, yRad, zRad){
            //distribui a rotação para cada componente
            for (var i=0; i<rocketModel.length; i++){
                rocketModel[i].rotateX(xRad);
                rocketModel[i].rotateY(yRad);
                rocketModel[i].rotateZ(zRad);
            }
        }
    }
}


//CONTROLE DE ANIMAÇÃO DO GIROSCÓPIO--------------------------------------------
function gyro_rotate_animation(boitata, line){
	//função que gera a animação de rotação.
    ctx.clearRect(-ctx.canvas.width/2, -ctx.canvas.height/2, ctx.canvas.width, ctx.canvas.height);

    ctx.font = '20pt Calibri';
    ctx.fillStyle = 'black';
    ctx.fillText(line[0], -ctx.canvas.width/2 + 50, -ctx.canvas.height/2 + 50);
    ctx.fillText(line[1], -ctx.canvas.width/2 + 50, -ctx.canvas.height/2 + 100);
    ctx.fillText(line[2], -ctx.canvas.width/2 + 50, -ctx.canvas.height/2 + 150);

    boitata.rotate(line[0], line[1], line[2]);
    boitata.draw();
}

function gyro_noData_animation(boitata){
    ctx.clearRect(-ctx.canvas.width/2, -ctx.canvas.height/2, ctx.canvas.width, ctx.canvas.height);
    
    boitata.rotate(0, 0.005, -0.000);
    boitata.draw();

    ctx.font = '60pt Calibri';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('NO DATA FOUND', 0, 0);
}


//"MAIN" DO ANALISADOR GYRO-----------------------------------------------------
function setup_gyro(){
    delete canvas;
    canvas = document.getElementById("gyro_canvas");

    //configurando o canvas
	ctx = canvas.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.globalAlpha = 0.8;
    ctx.translate(ctx.canvas.width/2,ctx.canvas.height/2);

    //rotacionar pois o canvas é invertido e o boitata é criado de ponta
    //cabeça
    var boitata = new rocket(15, 225, 15);
    boitata.rotate(3.14159, 0, 0);

    clearInterval(animation);

    if (lines.length==0){
        boitata.rotate(1.2, 0, 0);
        animation = setInterval(function(){
            gyro_noData_animation(boitata);
        }, 10);
    }
    else {

        var i=0;

        (function Rotate_animation(){
            if (i!=lines.length) {
                gyro_rotate_animation(boitata, lines[i++]);
                animation = setTimeout(Rotate_animation, 50);
            }
            else {
                ctx.font = '60pt Calibri';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'black';
                ctx.fillText('END OF INPUT', 0, 0);
            }
        })();
    }
}
