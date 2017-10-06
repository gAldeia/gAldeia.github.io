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
                    for(var j=0; j<points[i].length; j++){
                        nodeY = points[i][j][1];
                        nodeZ = points[i][j][2];
                
                        points[i][j][1] = (cos*nodeY) - (sin*nodeZ);
                        points[i][j][2] = (cos*nodeZ) + (sin*nodeY);
                    }
                }
            },
            
            rotateY : function(theta){
                //funçao que rotaciona todos os pontos em torno do eixo Y;
            
                var cos = Math.cos(theta);
                var sin = Math.sin(theta);
        
                for (var i=0; i<points.length; i++){
                    for(var j=0; j<points[i].length; j++){
                        nodeX = points[i][j][0];
                        nodeZ = points[i][j][2];
                
                        points[i][j][0] = (cos*nodeX) - (sin*nodeZ);
                        points[i][j][2] = (cos*nodeZ) + (sin*nodeX);
                    }
                }
            },
            
            rotateZ : function(theta){
                //funçao que rotaciona todos os pontos em torno do eixo Z;
            
                var cos = Math.cos(theta);
                var sin = Math.sin(theta);
            
                for (var i=0; i<points.length; i++){
                    for(var j=0; j<points[i].length; j++){
                        nodeX = points[i][j][0];
                        nodeY = points[i][j][1];
                
                        points[i][j][0] = (cos*nodeX) - (sin*nodeY);
                        points[i][j][1] = (cos*nodeY) + (sin*nodeX);
                    }
                }
            },

            draw : function(points, color){

                fov = 750;

                ctx.fillStyle = color;

                ctx.beginPath();
                ctx.moveTo(points[0][0]*fov/(fov+points[0][2]), points[0][1]*fov/(fov+points[0][2]));

                for(var i=1; i<points.length; i++){
                    ctx.lineTo(points[i][0]*fov/(fov+points[i][2]), points[i][1]*fov/(fov+points[i][2]));
                }
                ctx.closePath();
                ctx.fill();
            }
        }
    }    

    var rocketCoifa = function(sizeXZ, sizeY, posY, color){
        
        var pl = 13;
        var points = [];
        var Manager3D = new Model3DManager(points);

        for (var i=0; i<pl; i++){
            points[i] = [
                [sizeXZ, -sizeY+posY, sizeXZ],
                [0, (-sizeY*1.7)+posY, 0],
            ];
            Manager3D.rotateY(6.283/(pl-1), points);
            points[i].push([sizeXZ, -sizeY+posY, sizeXZ]);
        }

        return {
            rotateX : function(theta){
                Manager3D.rotateX(theta);
            },
            rotateY : function(theta){
                Manager3D.rotateY(theta);
            },
            rotateZ : function(theta){
                Manager3D.rotateZ(theta);
            },
            draw : function(){
                //desenha o cilindro de cor laranja (transparente).
                //desenha todos os retangulos
                for (var i=0; i<pl; i++){
                    Manager3D.draw(points[i], color);
                }
            }
        }
    }

    var rocketBody = function(sizeXZ, sizeY, posY, color){
        
        //MÁGICA. NÃO TOQUE. NÃO OLHE. NÃO TENTE ENTENDER
        
        var pl = 13; //numero de poligonos
        var points = [];
        var Manager3D = new Model3DManager(points);

        //fazer um cilindro com pontos (lembrando que y cresce de cima para
        //baixo)
        for(var i=0; i<pl; i++){
            points[i] = [
                [sizeXZ, -sizeY+posY, sizeXZ],
                [sizeXZ, sizeY+posY, sizeXZ]
            ];
            Manager3D.rotateY(6.283/(pl-1), points);
            points[i].push(
                [sizeXZ, sizeY+posY, sizeXZ],
                [sizeXZ, -sizeY+posY, sizeXZ]
            );
        }
        //ponto para ser o bico da coifa do foguete
        points.push([0, sizeY*1.45, 0]);

        return {
            rotateX : function(theta){
                Manager3D.rotateX(theta);
            },
            rotateY : function(theta){
                Manager3D.rotateY(theta);
            },
            rotateZ : function(theta){
                Manager3D.rotateZ(theta);
            },
            draw : function(){
                //desenha o cilindro de cor laranja (transparente).
                //desenha todos os retangulos
                for (var i=0; i<pl; i++){
                    Manager3D.draw(points[i], color);
                }
            }
        }
    }

    var rocketFins = function(sizeXZ, sizeY, posY, color){

        var points = [ ];
        var Manager3D = new Model3DManager(points);
        var nOf = 5; //numero de empenas

        for(var i=0; i<nOf; i++){
            points[i] = [
                [sizeXZ, -sizeY+posY, sizeXZ],
                [sizeXZ, -sizeY*1.35+posY, sizeXZ],
                [sizeXZ*3, -sizeY*1.25+posY, sizeXZ*3],
                [sizeXZ*3, -sizeY*1.1+posY, sizeXZ*3]
            ];
            Manager3D.rotateY(6.283/(nOf-1), points);
        }

        return {
            rotateX : function(theta){
                Manager3D.rotateX(theta);
            },
            rotateY : function(theta){
                Manager3D.rotateY(theta);
            },
            rotateZ : function(theta){
                Manager3D.rotateZ(theta);
            },
            draw : function(){
                for (var i=0; i<nOf; i++){
                    Manager3D.draw(points[i], color);
                }
            }
        }
    }

    //guardar o modelo
    var rocketModel = [
        new rocketBody(sizeX, sizeY, 0, "#ea9f15"),
        new rocketBody(sizeX, sizeY*0.15, sizeY*1.15, "#000000"),
        new rocketCoifa(sizeX, sizeY*0.7, -sizeY*0.3 , "#000000"),
        new rocketFins(sizeX, sizeY*0.7, sizeY*1.95 , "#000000")
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
    ctx.globalAlpha = 0.9;
    ctx.translate(ctx.canvas.width/2,ctx.canvas.height/2);

    //rotacionar pois o canvas é invertido e o boitata é criado de ponta
    //cabeça
    var boitata = new rocket(15, 225, 15);

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
