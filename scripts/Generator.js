//Generator.js


function Eval(range, nOfVars){
    let display = "<table style='width: 300px'><tr><th>f(x)</th>";

    for(let i=0; i<nOfVars; i++){
        display += "<th>x"+i+"</th>";
    }
    display+="</tr>";

    for(let i=1; i<range; i++){
        let exp = document.getElementById("expressionInput").value;

        let lines = "";
        for(let j=1; j<=nOfVars; j++){
            exp = exp.split("x"+j).join(i);
            lines+="<td>"+i+"</td>";
        }
        display+="<tr><td>"+eval(exp)+"</td>"+lines+"</tr>";
    }
    document.getElementById("expressionOutput").innerHTML=display+"</table>";
}

function generateLines(){
    let range = document.getElementById("range").value;
    let nOfVars = 0;

    for(let i=0; i<10; i++){
        let expressionToCount = document.getElementById("expressionInput").value;
        if (expressionToCount.split("x"+i).length - 1)
            nOfVars++;
    }
    Eval(range, nOfVars);
}