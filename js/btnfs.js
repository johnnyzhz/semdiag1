/***************************************************
 * semdiag: draw SEM path diagram interactively    *
 * Authors: Yujiao Mai, Zhiyong Zhang, Ke-Hai Yuan *
 * Copyright 2015-2015, psychstat.org              *
 * Licensed under the MIT License (MIT)            *
 * Current software version 1.0                    *
 * Support email for questions zzhang4@nd.edu      *
 *                             ymai@nd.edu         * 
 ***************************************************/
 
/*the file 'btnfs.js': the following functions are to response the buttons and selection events*/
////////////////////////////////////////////////////////////////////////////////////////////////
 function BTNrect(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	var newrectnode = node_add (newnodeInitialPos_rect, default_RADIUSH,default_RADIUSV, defaultFONTSIZE, "rect");
	//to stagger the new nodes
	if(newnodeInitialPos_rect.x-nodeInitialPos_rect.x >= loopTagger_newnode*default_RADIUSH) {
		newnodeInitialPos_rect.x = nodeInitialPos_rect.x;
	} else {newnodeInitialPos_rect.x=newnodeInitialPos_rect.x+default_RADIUSH; }
	if(newnodeInitialPos_rect.y-nodeInitialPos_rect.y >= loopTagger_newnode*default_RADIUSV) {
		newnodeInitialPos_rect.y = nodeInitialPos_rect.y;
	} else {newnodeInitialPos_rect.y=newnodeInitialPos_rect.y+default_RADIUSV;}		
	updatesvg();
 }
 
 function BTNellipse(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;			
	var newrectnode = node_add (newnodeInitialPos_ellipse, default_RADIUSH,default_RADIUSV, defaultFONTSIZE, "ellipse");
	//to stagger the new nodes
	if(newnodeInitialPos_ellipse.x-nodeInitialPos_ellipse.x >= loopTagger_newnode*default_RADIUSH) {
		newnodeInitialPos_ellipse.x = nodeInitialPos_ellipse.x;
	} else {newnodeInitialPos_ellipse.x=newnodeInitialPos_ellipse.x+default_RADIUSH; }
	if(newnodeInitialPos_ellipse.y-nodeInitialPos_ellipse.y >= loopTagger_newnode*default_RADIUSV) {
		newnodeInitialPos_ellipse.y = nodeInitialPos_ellipse.y;
	} else {newnodeInitialPos_ellipse.y=newnodeInitialPos_ellipse.y+default_RADIUSV;}
	// add a self-curve /path for the ellipse when it is created --by Yujiao, September 9, 2015
	newnodeindex=matchnodeindex(nodes,newrectnode.id);
	edge_add(newnodeindex, newnodeindex, 'bi');	
	updatesvg();
 }

//function： 
function BTNtriangle(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	if (svgstatus.nodeselected === 1){ 
		for (var i=0; i< selectednodeindexes.length; i++){
			tselectednodeindex= selectednodeindexes[i];
			var selectednode = nodes[tselectednodeindex];
			if (selectednode.type === "rect" || selectednode.type ==="ellipse"){				
				if (numTri=== 0) {
					// set a different initial position of triangle from rect
					tnodeInitialPos = {x: nodeInitialPos.x-2*default_RADIUSH,y:nodeInitialPos.y-default_RADIUSV};	
					theTriangle= node_add (tnodeInitialPos, default_RADIUSH,default_RADIUSV,  defaultFONTSIZE,"triangle");
				} else {
					//do nothing
				}				
				var newbcurve = generate_edge(nodes,theTriangle.id, selectednode.id, "uni");
				var found_index=lookfor_duplicatedbcurve(nodes,edges,newbcurve.startid,newbcurve.endid, "uni");
				if ( found_index >=0) {
				} else {
					var newtangent = generate_tangent(nodes,newbcurve);
					edges.push(newbcurve);  numEdge++; 
					edges_tangents.push(newtangent);				
				} 
			}else {// do nothing			
			}
		} // end of for (var i=0; i< selectednodeindexes.length; i++){}				
		updatesvg();
	}

}

//function： 
function BTNlinkingto(){
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;

	linkingtoArrowTYPE="uni"; 
	var tempedgeids=[];
	if(svgstatus.edgeselected ===1){
		for(var i=0; i<selectededgeindexes.length; i++){
			var tselectededgeindex=selectededgeindexes[i];
			var tempid= edges[tselectededgeindex].id;
			tempedgeids.push(tempid);
		}
	}
	if (svgstatus.edgeselected === 1){ 
		for (var i=0; i< selectededgeindexes.length; i++){			
			var tselectededgeindex= matchedgeindex(edges,tempedgeids[i]);
			if (tselectededgeindex >= 0 & tselectededgeindex < edges.length){
				var currentbcurve = edges[tselectededgeindex];
				if(currentbcurve.type != linkingtoArrowTYPE){ 
					if (currentbcurve.power === 2){
						edges[tselectededgeindex].type = linkingtoArrowTYPE; 
						var startnodeindex=matchnodeindex(nodes,currentbcurve.startid);
						var endnodeindex = matchnodeindex(nodes,currentbcurve.endid);					
						if ( currentbcurve.labelInitial){	
							var templabel = generate_label(nodes[startnodeindex],nodes[endnodeindex],"uni",2);
							edges[tselectededgeindex].label=templabel;
						}						
						if (nodes[startnodeindex].type === "triangle"){
							//do nothing.	
						}else {
							var newedgeindex = edge_add(endnodeindex, endnodeindex, "bi");
							if (newedgeindex >=0 & newedgeindex<edges.length) {
								edges[newedgeindex].IsAutoGenerated = true;
							}
						}						
					} else if (currentbcurve.power==3){					
					}
				}						
			}//end of if (selectededgeindex >= 0 & selectededgeindex < edges.length){}
		}//end of for (var i=0; i< selectededgeindexes.length; i++){}
		EdgesUnselected();
		updatesvg();
	} else if (svgstatus.nodeselected === 1){
		if(selectednodeindexes.length==1){
			var tselectednodeindex=selectednodeindexes[0];
			if(tselectednodeindex>=0 & tselectednodeindex< nodes.length){
				svgstatus.linkingto = 2;
				linkinginitialindex = tselectednodeindex; 	
			}			
		} else {
			//do nothing.
		}		
	} else {
		svgstatus.linkingto = 1; 
		updatesvg();
	} // end of if () {} else{} 
}

//function： 
function BTNlinkingto2(){
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	linkingtoArrowTYPE="bi";
	var tempedgeids=[];
	if(svgstatus.edgeselected ===1){
		for(var i=0; i<selectededgeindexes.length; i++){
			var tselectededgeindex=selectededgeindexes[i];
			var tempid= edges[tselectededgeindex].id;
			tempedgeids.push(tempid);
		}
	}
	if (svgstatus.edgeselected === 1){
		for (var i=0; i< selectededgeindexes.length; i++){			
			var tselectededgeindex= matchedgeindex(edges,tempedgeids[i]);
			if (tselectededgeindex>=0 & tselectededgeindex< edges.length){
				var currentbcurve = edges[tselectededgeindex]; 
				if (currentbcurve.type != linkingtoArrowTYPE){		
					if(currentbcurve.power === 2){
						var startnode=nodes[matchnodeindex(nodes,currentbcurve.startid)]; 
						var endnode=nodes[matchnodeindex(nodes,currentbcurve.endid)];
					
						if (startnode.type==="triangle"){
							//do nothing
						}else {
							edges[tselectededgeindex].type = linkingtoArrowTYPE; 
							
							if (currentbcurve.labelInitial){				
								var templabel = generate_label(startnode,endnode,"bi",2);
								edges[tselectededgeindex].label=templabel;
							}							
							delete_nonuseedges(edges[tselectededgeindex].startid,edges[tselectededgeindex].endid, linkingtoArrowTYPE);
							
						}					
					} else if (currentbcurve.power === 3){
						//do nothing.
					}
				}
			}
		}//
		EdgesUnselected();
		updatesvg();		
	} else if (svgstatus.nodeselected === 1){
		if(selectednodeindexes.length==1){
			if(selectednodeindex>=0 & selectednodeindex< nodes.length){
				svgstatus.linkingto = 2;
				linkinginitialindex = selectednodeindex; 			
			}
		} else {
			//do nothing.
		}
	}else {			
		 svgstatus.linkingto = 1;
	} // end of if () {} else{} 	
}

function BTNtexting(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	if (svgstatus.nodeselected===1 || svgstatus.edgeselected ===1 || svgstatus.noteselected===1){
		if (svgstatus.nodeselected ===1){						
			var currentindex = selectednodeindex;
			var d = nodes[currentindex];			
			node_text_editing(d);
		} else if (svgstatus.edgeselected ===1){
			var currentindex = selectededgeindex;
			var d = edges[currentindex];			
			bcurve_text_editing(d,currentindex);		
		} else if (svgstatus.noteselected ===1){
			var currentindex = selectednoteindex;
			var d = notes[currentindex];			
			note_text_editing(d,currentindex);		
		}													
		updatesvg();							
	} else {					
		svgstatus.texting = 1;
	}
}

function BTNdel(){ 
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	var tempedgeids=[];
	var tempnodeids=[];
	var tempnoteids=[];
	if(svgstatus.edgeselected ===1){
		for(var i=0; i<selectededgeindexes.length; i++){
			var tselectededgeindex=selectededgeindexes[i];
			var tempid= edges[tselectededgeindex].id;
			tempedgeids.push(tempid);
		}
	}
	if(svgstatus.nodeselected ===1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex=selectednodeindexes[i];
			var tempid= nodes[tselectednodeindex].id;
			tempnodeids.push(tempid);
		}
	}	
	if(svgstatus.edgeselected ===1){
		for(var i=0; i<selectededgeindexes.length; i++){		
			var tselectededgeindex = matchedgeindex(edges, tempedgeids[i]);
			if( tselectededgeindex >=0 & tselectededgeindex < edges.length){
				var currentbcurveindex = tselectededgeindex;
				edge_delete(currentbcurveindex);			
			}
		}
		EdgesUnselected();	
	}	
	if(svgstatus.nodeselected ===1){
		for(var i=0; i<selectednodeindexes.length; i++){
			
			var tselectednodeindex =  -1;
			tselectednodeindex = matchnodeindex(nodes,tempnodeids[i]);
			if(tselectednodeindex>=0 & tselectednodeindex<nodes.length){ 		
				var currentnodeindex = tselectednodeindex;		
				node_delete(currentnodeindex);								
			}
		}// end of for(var i=0; i<selectednodeindexes.length; i++){}
		NodesUnselected();	
	 }
	if(svgstatus.noteselected ===1){
		selectednoteindexes.sort(function(a, b){return b-a});//to sort the numbers descending
		for(var i=0; i<selectednoteindexes.length; i++){
			var tselectednoteindex = selectednoteindexes[i];
			if(tselectednoteindex >=0 & tselectednoteindex < notes.length){
				var currentnoteindex = tselectednoteindex;
				note_delete(currentnoteindex);
			}
		}
		NotesUnselected();	
	 }	
	 updatesvg();
}

function BTNred(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	
	var currentcolor='RED';
	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){
				edges[tselectededgeindex].color=currentcolor;
			 }
		 }
	 }// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){
				nodes[tselectednodeindex].color=currentcolor;
			}
		}
	 }// end if
	 if(svgstatus.noteselected === 1){
		for(var i=0; i<selectednoteindexes.length; i++){ 
			var tselectednoteindex = selectednoteindexes[i];
			if(tselectednoteindex>=0 & tselectednoteindex<notes.length){
				notes[tselectednoteindex].color=currentcolor;
			}
		}
	 }// end if
	 updatesvg();
}

function BTNblue(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;

	var currentcolor='BLUE';
	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){
				edges[tselectededgeindex].color=currentcolor;
			 }
		 }
	 }// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){
				nodes[tselectednodeindex].color=currentcolor;
			}
		}
	 }// end if
	 if(svgstatus.noteselected === 1){
		for(var i=0; i<selectednoteindexes.length; i++){ 
			var tselectednoteindex = selectednoteindexes[i];
			if(tselectednoteindex>=0 & tselectednoteindex<notes.length){
				notes[tselectednoteindex].color=currentcolor;
			}
		}
	 }// end if
	 updatesvg();
}

function BTNgreen(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;

	var currentcolor='GREEN';
	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){
				edges[tselectededgeindex].color=currentcolor;
			 }
		 }
	 }// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){
				nodes[tselectednodeindex].color=currentcolor;
			}
		}
	 }// end if
	 if(svgstatus.noteselected === 1){
		for(var i=0; i<selectednoteindexes.length; i++){ 
			var tselectednoteindex = selectednoteindexes[i];
			if(tselectednoteindex>=0 & tselectednoteindex<notes.length){
				notes[tselectednoteindex].color=currentcolor;
			}
		}
	 }// end if
	 updatesvg();
}

function BTNblack(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;

	var currentcolor='BLACK';
	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){ // for selected edges
				edges[tselectededgeindex].color=currentcolor;
			 }
		 }
	 }// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){ // for selected nodes
				nodes[tselectednodeindex].color=currentcolor;
			}
		}
	 }// end if
	 if(svgstatus.noteselected === 1){
		for(var i=0; i<selectednoteindexes.length; i++){ 
			var tselectednoteindex = selectednoteindexes[i];
			if(tselectednoteindex>=0 & tselectednoteindex<notes.length){ // for selected notes
				notes[tselectednoteindex].color=currentcolor;
			}
		}
	 }// end if
	 updatesvg();
}

function BTNsolid(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;

	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){ //for selected edges
				edges[tselectededgeindex].dotted=0;
			 }
		 }
	 }// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){ //for selected nodes
				nodes[tselectednodeindex].strokedotted=0;
			}
		}
	 }// end if
	updatesvg();
}

function BTNdotted(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;

	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){ //for selected edges
				edges[tselectededgeindex].dotted=1;
			 }
		 }
	 }// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){ //for selected nodes
				nodes[tselectednodeindex].strokedotted=1;
			}
		}
	 }// end if
	updatesvg();
}

function BTNla(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	svgstatus.IsShowLabels = ! svgstatus.IsShowLabels;
	updatesvg();
}

function BTNgrid(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	svgstatus.IsShowGrid = ! svgstatus.IsShowGrid;
	updatesvg();
}

//begin list menu
function getSelectValue_FontSize(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
    var oSelect = document.getElementById("selectfontsize");
	var newfontsize=Number(oSelect.options[oSelect.selectedIndex].value);
	if(svgstatus.edgeselected === 1){
		for(var i=0; i<selectededgeindexes.length; i++){
			var tselectededgeindex = selectededgeindexes[i];
			if(tselectededgeindex>=0 & tselectededgeindex<edges.length){ //for selected edges
				edges[tselectededgeindex].labelFsize=newfontsize;
			}
		}
	}// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){ //for selected nodes
				nodes[tselectednodeindex].fontsize=newfontsize;
				//to adapt the node size to the length of the title
				if(nodes[tselectednodeindex].rx <= nodes[tselectednodeindex].title.length * nodes[tselectednodeindex].fontsize*0.5) {
					nodes[tselectednodeindex].rx = nodes[tselectednodeindex].title.length * nodes[tselectednodeindex].fontsize * 0.5;
					//to adapt the paths involved this resized node:					
					var relatedindexes = lookfor_relatededges(nodes[tselectednodeindex].id);//alert("relatedindexes:"+relatedindexes.length);
					for (var i =0; i< relatedindexes.length; i++){
						var tindex = relatedindexes[i];
						if (edges[tindex].power ===2) {
							edges[tindex]= update_bcurve2p(nodes,edges[tindex]);
						}else if (edges[tindex].power ===3){
							edges[tindex]= update_bcurve3p(nodes,edges[tindex], edges[tindex].theta, selfpathANGLE_default);
						}
						edges_tangents[tindex]=generate_tangent(nodes,edges[tindex]); //alert("generate_tangent!");
					}
				}
			}
		}
	 }// end if
	 if(svgstatus.noteselected === 1){
		for(var i=0; i<selectednoteindexes.length; i++){ 
			var tselectednoteindex = selectednoteindexes[i];
			if(tselectednoteindex>=0 & tselectednoteindex<notes.length){ //for selected notes
				notes[tselectednoteindex].fontsize=newfontsize;
			}
		}
	 }// end if	
	oSelect.value="default";
	updatesvg();
}

function getSelectValue_ErrorCurveSize(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
    var oSelect = document.getElementById("selectErrorCurveSize");
   var new_curve_LR=default_selfcurve_LR;
   	switch(oSelect.value){
		case "small": 
					new_curve_LR = default_RADIUSH * 2.7/2;
		break;
		case "medium":
					new_curve_LR = default_RADIUSH * 4/2;
		break;
		case "large":
					new_curve_LR = default_RADIUSH * 5.3/2;
		break;
		default:	new_curve_LR = default_selfcurve_LR;		
	}		
	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){		
				var currentbcurve = edges[tselectededgeindex];
				if (currentbcurve.power === 3){
					currentbcurve.curve_LR=new_curve_LR;
					edges[tselectededgeindex]=update_bcurve(nodes,currentbcurve);	
				}			
			 }
		 }
	 }// end if
	oSelect.value="default";
	updatesvg();
}

function getSelectValue_LineWidth(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
    var oSelect = document.getElementById("selectLineWidth");
	var new_strokewidth=default_strokeWIDTH;
	switch(oSelect.value){
		case "thin": 
			new_strokewidth = default_strokeWIDTH;
		break;
		case "medium":
			new_strokewidth = default_strokeWIDTH * 4/2;
		break;
		case "thick":
			new_strokewidth = default_strokeWIDTH * 6/2;
		break;
		default:new_strokewidth = default_strokeWIDTH;		
	}		
	
	if(svgstatus.edgeselected === 1){
		 for(var i=0; i<selectededgeindexes.length; i++){
			 var tselectededgeindex = selectededgeindexes[i];
			 if(tselectededgeindex>=0 & tselectededgeindex<edges.length){ //for selected edges
				edges[tselectededgeindex].strokewidth = new_strokewidth;
			 }
		 }
	 }// end if
	if(svgstatus.nodeselected === 1){
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){ //for selected nodes
				nodes[tselectednodeindex].strokewidth = new_strokewidth;	
			}
		}
	 }// end if
	
	oSelect.value="default";
	updatesvg();
}

function getSelectValue_ChartSize(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
    var oSelect = document.getElementById("selectChartSize");

	switch(oSelect.value){
		case "small": 
					w=2000;h=2000;mysvg.attr("width",w).attr("height",h);  
		break;
		case "medium":
					w=3000;h=3000;mysvg.attr("width",w).attr("height",h);
		break;
		case "large":
					w=5000;h=5000;mysvg.attr("width",w).attr("height",h);
		break;
		default:	w=1000;h=1200;	mysvg.attr("width",w).attr("height",h);
	}		
	oSelect.value="default";
	updatesvg();
}

function BTNclone(){
	if (svgstatus.linkingto >= 1) {svgstatus.linkingto=0;linkinginitialindex=-1;linkingtargetindex=-1;}
	if (svgstatus.texting === 1) svgstatus.texting=0;
	if (svgstatus.multipleselecting===1) svgstatus.multipleselecting=0;
	var movex=default_RADIUSV;
	var movey=default_RADIUSH; 
	var originnodes=[];
	var newnodes=[];
	if(svgstatus.nodeselected === 1){
		selectednodeindexes.sort(function(a,b){return a-b});//sort up
		for(var i=0; i<selectednodeindexes.length; i++){
			var tselectednodeindex = selectednodeindexes[i];
			if( tselectednodeindex>=0 & tselectednodeindex<nodes.length){ 
				var originnode=nodes[tselectednodeindex];
				if(originnode.type==='triangle'){
					newnodes.push(originnode);
					originnodes.push(originnode);
				} else {
					var newnode = node_copy(originnode);
					if (newnode==null){					
					} else {
						newnode.x=originnode.x+movex;
						newnode.y=originnode.y+movey;
						newnodes.push(newnode);
						nodes[matchnodeindex(nodes,newnode.id)]=newnode;
						originnodes.push(originnode);
					}
				}
			}
		}
	}// end if
	var originedges=[];
	var newedges=[];
	if(svgstatus.edgeselected === 1){
		selectededgeindexes.sort(function(a,b){return a-b});//sort up
		for(var i=0; i<selectededgeindexes.length; i++){
			var tselectededgeindex = selectededgeindexes[i];
			if( tselectededgeindex>=0 & tselectededgeindex<edges.length){
				var originedge=edges[tselectededgeindex];
				var startnodeindex=matchnodeindex(originnodes,originedge.startid);
				var endnodeindex=matchnodeindex(originnodes,originedge.endid);
				if ((startnodeindex != -1) & (endnodeindex != -1) ){
					var newedge =  generate_edge(newnodes,newnodes[startnodeindex].id, newnodes[endnodeindex].id, originedge.type); 					
					if(newnodes[startnodeindex].type==='triangle'){						
					} else {
						newedge.handleP={x:originedge.handleP.x+movex,y:originedge.handleP.y+movey};
						newedge.labelP={x:originedge.labelP.x+movex, y: originedge.labelP.y+movey};
					}					
					newedge.dotted=originedge.dotted;
					newedge.color=originedge.color;
					newedge.strokewidth=originedge.strokewidth;
					newedge.label=originedge.label;
					newedge.labelFsize=originedge.labelFsize;
					newedge.labelshow=originedge.labelshow;
					newedge.handleshow=false;
					newedge.handleInitial=originedge.handleInitial;
					newedge.IsAutoGenerated=originedge.IsAutoGenerated;
					newedge.curve_LR=originedge.curve_LR;
					newedge.selected=true;
					newedge=update_bcurve(newnodes,newedge);					
					if (newedge==null){					
					} else {
						var newedgeindex = edge_add_newbcurve(newedge);
						newedges.push(newedge);
						originedges.push(originedge);
					}						
				}
			}
		}
	}// end if 
	 
	var newchartsize =AdjustChartSize(nodes, edges, edges_tangents, notes);
	if (newchartsize.w > w) { w = newchartsize.w}
	if (newchartsize.h > h) { h = newchartsize.h}

	if(svgstatus.nodeselected===1){		NodesUnselected();	}
	if(svgstatus.edgeselected===1){		EdgesUnselected();	}
	if(svgstatus.noteselected===1){		NotesUnselected();	}
	for(var i=0; i<newnodes.length;i++){
		tindex=matchnodeindex(nodes,newnodes[i].id);
		selectednodeindexes.push(tindex);
		selectednodeindex=tindex;
	}
	if(selectednodeindexes.length>=1) svgstatus.nodeselected=1;
	for(var i=0; i<newedges.length;i++){
		tindex=matchedgeindex(edges,newedges[i].id);
		selectededgeindexes.push(tindex);
		selectededgeindex=tindex;
	}
	if(selectededgeindexes.length>=1)svgstatus.edgeselected=1;	
	
	updatesvg();	
}

//functions: export
jQuery.download = function(url, data, method) {
    if (url && data) {
        data = typeof data == 'string' ? data : jQuery.param(data);
        var inputs = '';
        jQuery.each(data.split('&'), function() {
            var pair = this.split('===');
            inputs += '<input type="hidden" name="' + pair[0] +
                '" value="' + pair[1] + '" />';
        });
        //send request
        jQuery('<form action="' + url +
                '" method="' + (method || 'post') + '">' + inputs + '</form>')
            .appendTo('body').submit().remove();
    };
};

function BTNSAVE(){		
    try {
		var tdiagname=diagName;
		var tdiagtxt = GraphToText2();		
		if($('#inputnamedialog'))$('#inputnamedialog').remove();
		var dialog = document.createElement('div'); 
			dialog.id='inputnamedialog';	
			dialog.style.color = 'black';		
		var content = document.createElement('div');
			content.style="width=230px; height=100px";			
		var form = document.createElement('form');
			form.id = 'inputnameform';
		var input = document.createElement('input');
			input.id='nameinput';
			input.type = 'text';
			input.name = 'text';															
			input.style="width=200px; height=50px";
			input.contentEditable=true;																
			input.value = tdiagname;
			input.focus();
			$(input).keydown(function (event){
				tdiagname=input.value;
				if (event.keyCode == 13 || event.witch==13) {				
					event.preventDefault();	
					$(button1).click();
					return false;
				}	
			} );
		form.appendChild(input);
		content.appendChild(form);
		
		var button1 = document.createElement('button');
			button1.innerHTML = 'OK';
			button1.id="dialogbuton1";
			$(button1).click(function () { 
				tdiagname = input.value;
				diagName = tdiagname;
				$.download(
				'http://semdiag.psychstat.org/download.php',
				'filename===' + tdiagname + '&filecontent==='+ tdiagtxt + '&filetype==='+ 'diag'
				);
				$(dialog).dialog('close');
				$('#inputnamedialog').remove();
			});
		content.appendChild(button1);		
		var button2 = document.createElement('button');
			button2.innerHTML = 'Cancel';
			button2.id="dialogbuton2";
			button2.styles="margin-left:2px";
			$(button2).click(function () {
				$(dialog).dialog('close');
				$('#inputnamedialog').remove();
			});
		content.appendChild(button2);		
		dialog.appendChild(content); 
		//show dialog
		$(dialog).dialog({
			modal: true,
			title: 'Save Diagram',
			width: "230",
			height: '130',
			bgiframe: true,
			closeOnEscape: true,
			draggable: true,
			resizable: true
		});	

    } catch (e) {
        alert('SAVE:' + e);
	}	
}

function svgRender(_newgraph){
	var _newnodes=_newgraph.nodes;
	var _newedges=_newgraph.edges;
	var _newnotes=_newgraph.notes;
	var _newmarks=_newgraph.marks;	
	
	Nodecurrent_IdNUM=_newmarks.Nodecurrent_IdNUM;
	Edgecurrent_IdNUM=_newmarks.Edgecurrent_IdNUM;
	Elli_current_TitleNUM=_newmarks.Elli_current_TitleNUM;
	Rec_current_TitleNUM=_newmarks.Rec_current_TitleNUM;
	h=_newmarks.h;
	w=_newmarks.w;
	nodes = _newnodes;
	edges = _newedges;
	edges_tangents = [];
	edges_tangents = generate_tangents(nodes,edges);
	notes = _newnotes;
	
	ellipsenodes = nodes.filter(function(d){
									      return d.type == "ellipse";
									});
	rectnodes = nodes.filter(function(d){
									      return d.type == "rect";
									});
	trianglenodes = nodes.filter(function(d){
									      return d.type == "triangle";
									});
									
	numRec=rectnodes.length;
	numElli=ellipsenodes.length;
	numTri=trianglenodes.length;
	numNode=nodes.length;
	numEdge=edges.length;
	numNote=notes.length;
	if(numTri>0) theTriangle=trianglenodes[0];
	updatesvg();
}

//function：  LOAD() /BTNLOAD()
function BTNLOAD(){
	var tdiagname="";
	var tdiagtxt="";
		if($('#uploadfiledialog'))$('#uploadfiledialog').remove();	
		var dialog = document.createElement('div');
		dialog.id="uploadfiledialog";	
		var inputdiv = document.createElement('div');
		inputdiv.id="inputdiv";
		inputdiv.style="width:280px";
		var input= document.createElement('input');
		input.id="inputfile";
		input.type="file";
		input.style="width:280px";
		inputdiv.appendChild(input);								
		dialog.appendChild(inputdiv);
		$(dialog).dialog({
			modal: true,
			title: 'Select diagram',
			width: "400",
			height: "100",
			bgiframe: true,
			closeOnEscape: true,
			draggable: true,
			resizable: false
		});		
		
		d3.select('#inputfile').on('change', function(){
			var files =this.files; // FileList object
			var f=files[0];
			var tfilename=f.name; 
			tfilename.substr(0,tfilename.length);
			var textendname=tfilename.substr(tfilename.length-5,tfilename.length);
			if (!f) {
				alert("Failed to load the file.");
							$(dialog).dialog('close');
							$('#uploadfiledialog').remove();	
			} else if (textendname!='.diag') {
				alert(f.name + " is not a diagram file.");
			} else {				
				tdiagname=tfilename.replace(".diag", ""); 
				var reader = new FileReader();
				  // Closure to capture the file information.			
				reader.onload = (function(thefile) { 
						
						return function(event) {												 
							var txt = "";
								txt = event.target.result;		 
							tdiagtxt=txt;			
							$(dialog).dialog('close');
							$('#uploadfiledialog').remove();																
							if (tdiagname ==""){ 
							} else {
								try {
									var graph = GraphFromText2(tdiagtxt); 														 
									if (graph.nodes.length ==0){									
									} else {
										svgRender(graph); 
										diagName =tdiagname;	
									}								
								} catch (e) {
									alert('LOAD: rendering' + e);
								}
							}
						};					
				 })(f);				
				 // Read in the image file as a data Text.
				reader.readAsText(f,'UTF-8');
			}
		});
}

function BTNNEW(){
	var rconfirm=true;
	if (rconfirm){
		diagName = '';
		
		nodes=[	];  
		edges = [ ];		
		edges_tangents = [ ]; 
		notes=[ ];
		numRec=0;
		numElli=0;
		numTri=0;
		numNode=0;//the number of nodes
		numEdge=0;//the number of edges
		numnote=0;
		Nodecurrent_IdNUM=0;//mark the unique id num for each new node 
		Elli_current_TitleNUM=0;//mark the title num for generate title of ellipses
		Rec_current_TitleNUM=0;//mark the title num for generate title of rectangles
		Edgecurrent_IdNUM=0;//mark the unique id num for each new edge
		newnodeInitialPos_rect={x:nodeInitialPos_rect.x,y:nodeInitialPos_rect.y};//mark the varied initial position for crating new node
		newnodeInitialPos_ellipse={x:nodeInitialPos_ellipse.x,y:nodeInitialPos_ellipse.y};//mark the varied initial position for crating new node
		theTriangle = null;//node id/index of the only one triangle in this chart
		ellipsenodes=null;//the template data of elli kind of nodes 
		rectnodes=null;//the template data of rect kind of nodes 
		trianglenodes=null;
		h=2000;
		w=2000;

		//to mark down the status in order to choose appropriate action
		svgstatus ={
			svgondragged:0,
			nodeondragged:0,
			nodeselected:0,
			pathselected:0,
			labelselected:0,
			noteselected:0,
			linkingto:0,	
			texting:0,
			IsShowLabels:true,
			IsShowGrid:true
		}
		//mark the selected object
		svgdragline = {x0:0, y0:0, x1:0, y1:0}
		justmousedownnodeindex = -1;
		justmousedownedgeindex = -1;
		justmousedownnoteindex=-1;
		predraggedindex = -1;
		selectednodeindex = -1; 
		selectededgeindex = -1;
		selectednoteindex = -1;
		linkinginitialindex = -1;
		linkingtargetindex = -1;
		selcetedBTNID="";
		mouseLastclickOBJETid;
		mouseCurrentclickOBJETid
		mouseLastclicktime=null;
		mouseCurrentclicktime=null;
		//append svg:g  as container for the SEM graph	
		mysvgG=null;
		mysvgG_foreignObject=null;
		pathGs=null;
		handleGs=null;
		nodeGs=null;
		ellipseGs=null;
		rectGs=null;
		triangleGs=null;
		paths=null; 
		handlePs=null; 
		labelTs=null; 
		ellipses=null;
		rects=null; 
		triangles=null;
		nodetexts=null;
		noteTs=null;
		//
		updatesvg();

	}
}

function BTNGraphToSVG(){
	var tdiagname=diagName;
	var svgtxt = GraphToSVG(nodes,edges,edges_tangents,notes);	
	$.download(
    'http://semdiag.psychstat.org/download.php',
	'filename===' + tdiagname + '&filecontent==='+ svgtxt + '&filetype==='+ 'svg'		
    );
}

///////////////////////////////main menu  buttons////////////////////////////////////////////////////////////////////////////////////////////////
// button events
	d3.select("#BTNrect")
			.on("click", function(){
						selcetedBTNID = "BTNrect";
						d3.event.stopPropagation();	
						BTNrect();
					});
	d3.select("#BTNellipse")
			.on("click", function(){
						selcetedBTNID = "BTNellipse";
						d3.event.stopPropagation();	
						BTNellipse();
					});
	d3.select("#BTNtriangle") 
			.on("click", function(){
						selcetedBTNID = "BTNtriangle";
						d3.event.stopPropagation();							
						BTNtriangle();
					});					

	d3.select("#BTNlinkto")
			.on("click", function(){
							selcetedBTNID = "BTNlinkto";
							d3.event.stopPropagation();	
							BTNlinkingto();
					});
	d3.select("#BTNlinktobi")
			.on("click", function(){
							selcetedBTNID = "BTNlinktobi";
							d3.event.stopPropagation();	
							BTNlinkingto2();
					});	

	d3.select("#BTNtexting")
			.on("click", function(){
						selcetedBTNID = "BTNtexting";
						d3.event.stopPropagation();	
						BTNtexting();
					});					
					
	d3.select("#BTNDEL")
			.on("click", function(){
						selcetedBTNID = "BTNDEL";
						d3.event.stopPropagation();	
						BTNdel();
					});
	
	d3.select("#BTNclone")
			.on("click", function(){
						selcetedBTNID = "BTNclone";
						d3.event.stopPropagation();	
						BTNclone();
					 });
					
	d3.select("#BTNBLACK")
			.on("click", function(){
						selcetedBTNID = "BTNBLACK";
						d3.event.stopPropagation();	
						BTNblack();
					});
					
	d3.select("#BTNRED")
			.on("click", function(){
						selcetedBTNID = "BTNRED";
						d3.event.stopPropagation();	
						BTNred();

					});
	d3.select("#BTNGREEN")
			.on("click", function(){
						selcetedBTNID = "BTNGREEN";
						d3.event.stopPropagation();	
						BTNgreen();

					});
	d3.select("#BTNBLUE")
			.on("click", function(){
						selcetedBTNID = "BTNBLUE";
						d3.event.stopPropagation();	
						BTNblue();
					});

	d3.select("#BTNSOLID")
			.on("click", function(){
						selcetedBTNID = "BTNSOLID";
						d3.event.stopPropagation();	
						BTNsolid();
						 
					});
	d3.select("#BTNDOTTED")
			.on("click", function(){
							selcetedBTNID = "BTNDOTTED";
							d3.event.stopPropagation();	
							BTNdotted();
						 });	
						 
	d3.select("#BTNLa")
			.on("click", function(){
						selcetedBTNID = "BTNLa";
						d3.event.stopPropagation();	
						BTNla();
						
					 });
	d3.select("#BTNGrid")
			.on("click", function(){
						selcetedBTNID = "BTNGrid";
						d3.event.stopPropagation();	
						BTNgrid();
					 });
	d3.select("#BTNload")
		.on("click", function(){
					selcetedBTNID = "BTNload";
					d3.event.stopPropagation();	
					BTNLOAD();
				 });
	d3.select("#BTNnew")
		.on("click", function(){
					selcetedBTNID = "BTNnew";
					d3.event.stopPropagation();	
					BTNNEW();
				 });						 
		 
	d3.select("#BTNsave")
			.on("click", function(){
						selcetedBTNID = "BTNGrid";
						d3.event.stopPropagation();	
						BTNSAVE();
					 });
	d3.select("#BTNtoSVG")
			.on("click", function(){
						selcetedBTNID = "BTNtoSVG";
						d3.event.stopPropagation();	
						BTNGraphToSVG();
					 });	
		 
//end buttons menu


