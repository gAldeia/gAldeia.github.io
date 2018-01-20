//main.js


//aqui todas as implementações específicas à página são feitas, para separar
//a biblioteca desenvolvida com as funções de interesse específico.


function changeIcon(element, language){

    //função para trocar o ícone em collapses

    let down = "glyphicon glyphicon-triangle-bottom";
    let up = "glyphicon glyphicon-triangle-top";

    if (document.getElementById(element).className==down)
        document.getElementById(element).className=up;
    else
        document.getElementById(element).className=down;
}


function user_upload(element, language, type){
    try{
        if (type == 'csv')
            csv_upload(element);
        else if (type=='manual')
            manual_upload(element);
        
            document.getElementById("notification").innerHTML= "<div class='alert alert-success'>" + (language=='pt' ? "<strong>Sucesso!</strong> Os dados foram carregados.</div>" :"<strong>Success!</strong> Data loaded.</div>");
    }
    catch(err){
        if (err == "undefined csv")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt' ? "<strong>Atenção!</strong> O site só aceita arquivos de extensão .csv, e o algoritmo precisa de pelo menos uma linha de entrada para funcionar.</p></div>" : "<strong>Warning!</strong> The site only accepts .csv files, and the algorithm needs at least one input line to work.</p></div>");
        else if (err == "corrupted lines")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt'? "<strong>Atenção!</strong> Nem todas as suas linhas de entrada contém a mesma quantidade de números!</p></div>" : "<strong>Warning!</strong> Not all of your input lines contains the same amount of numbers!</p></div>");
        else if (err == "no data")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt'? "<strong>Atenção!</strong> O algoritmo precisa de pelo menos uma linha de entrada para funcionar.</p></div>" : "<strong>Warning!</strong> The algorithm needs at least one input line to work.</p></div>");
        else if (err == "only 1 value")
            document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'>" + (language=='pt'? "<strong>Atenção!</strong> cada linha precisa de pelo menos 2 valores!</p></div>" : "<strong>Warning!</strong> Each line needs at least 2 values!</p></div>");
    }
}