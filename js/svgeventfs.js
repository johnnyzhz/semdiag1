/***************************************************
 * semdiag: draw SEM path diagram interactively    *
 * Authors: Yujiao Mai, Zhiyong Zhang, Ke-Hai Yuan *
 * Copyright 2015-2015, psychstat.org              *
 * Licensed under the MIT License (MIT)            *
 * Current software version 1.0                    *
 * Support email for questions zzhang4@nd.edu      *
 *                             ymai@nd.edu         * 
 ***************************************************/
 
/* the file 'svgeventfs.js': the following functions are to response the interactively mouse/keyboard events on the svg chart */
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function NodesUnselected(){
	for (var i=0;i<selectednodeindexes.length;i++){
		if(selectednodeindexes[i]>=0 && selectednodeindexes[i]<nodes.length){
			nodes[selectednodeindexes[i]].selected = false;		
		}
	}
	selectednodeindex=-1;
	selectednodeindexes=[];
	svgstatus.nodeselected=0;
}
function EdgesUnselected(){
	for (var i=0;i<selectededgeindexes.length;i++){
		if(selectededgeindexes[i]>=0 && selectededgeindexes[i]<edges.length){
			edges[selectededgeindexes[i]].selected = false;		
		}
	}
	selectededgeindex=-1;
	selectededgeindexes=[];
	svgstatus.edgeselected=0;
}
function NotesUnselected(){
	for (var i=0;i<selectednoteindexes.length;i++){
		if(selectednoteindexes[i]>=0 && selectednoteindexes[i]<notes.length){
			notes[selectednoteindexes[i]].selected = false;		
		}
	}
	selectednoteindex=-1;
	selectednoteindexes=[];
	svgstatus.noteselected=0;
}

//function：OnNodeMouseDown
function OnNodeMouseDown(thisnode, d, i){
	var currentindex = matchnodeindex(nodes, d.id); 
	justmousedownnodeindex = currentindex; 
	if (svgstatus.linkingto >= 1) { 
		if (svgstatus.linkingto === 1){ 
			linkinginitialindex =currentindex; 
		} else if (svgstatus.linkingto === 2){
			//do nothing;
		}
	} else if (svgstatus.nodeselected === 1) { 
		
	}										
}

//function：OnNodeMouseUp
function OnNodeMouseUp(thisnode,d,i){
	var currentindex = matchnodeindex(nodes, d.id);  
	if (svgstatus.linkingto >= 1) { 
		if (linkinginitialindex != -1){ 
			linkingtargetindex = currentindex; 			
			edge_add(linkinginitialindex, linkingtargetindex, linkingtoArrowTYPE);
			linkinginitialindex = -1;
			linkingtargetindex = -1;
			svgdragline.x0=0;svgdragline.y0=0;svgdragline.x1=0;svgdragline.y1=0;
		} 									
		svgstatus.linkingto = 0;
	}  else {
		if (svgstatus.texting === 1){
			node_text_editing(d,i);
			svgstatus.texting =0;
		} 
		if ( justmousedownnodeindex === currentindex) {
			if (svgstatus.nodeselected === 1) {
				if (selectednodeindex === currentindex){
					mouseCurrentclicktime= new Date();	
					if (mouseCurrentclicktime - mouseLastclicktime <= 300){								
						node_text_editing(d,i);
					}					
				}				
			}
			if(svgstatus.nodeselected===1){		if(!d3.event.ctrlKey){	NodesUnselected();	}	}
			if(svgstatus.edgeselected===1){		if(!d3.event.ctrlKey){	EdgesUnselected();	}	}
			if(svgstatus.noteselected===1){		if(!d3.event.ctrlKey){	NotesUnselected();	}	}
			var foundindexes=findIndexes(selectednodeindexes,currentindex);
			if (foundindexes.length==0) {	
				selectednodeindex = currentindex; 
				selectednodeindexes.push(selectednodeindex);					
				nodes[selectednodeindex].selected =true; 			
				svgstatus.nodeselected = 1;	
			}												
			mouseLastclicktime= new Date();
		}// end of if (justmousedownnodeindex === currentindex)
	}// else if (linkingto)
	if (svgstatus.nodeondragged ===1) {	
		svgstatus.nodeondragged = 0;	
	} 												
	justmousedownnodeindex=-1;
	updatesvg();
}

//function：OnNodeDragStart
function OnNodeOnDragStart(thisnode,d,i){
	svgstatus.nodeondragged = 1;
	var currentindex = matchnodeindex(nodes, d.id);									
	predraggedindex = currentindex;
}

function update_edge_with_moved_node(_node,_originP){			
			var relatedindexes = lookfor_relatededges(_node.id);
			for (var i =0; i< relatedindexes.length; i++){
				var tindex = relatedindexes[i];
				var currentedge=edges[tindex];
				labelP_delta_x = edges[tindex].labelP.x-edges[tindex].handleP.x; //for the new labelP: mark down the relative position
				labelP_delta_y = edges[tindex].labelP.y-edges[tindex].handleP.y;//for the new labelP				
				if (currentedge.power ===2) {
					var startnode=nodes[matchnodeindex(nodes,currentedge.startid)];
					var endnode=nodes[matchnodeindex(nodes,currentedge.endid)];
					var witchnode = "startP";
					var originmiddlex=-1;
					var originmiddley=-1;
					if (currentedge.startid === _node.id){
							witchnode = "startP";							
							
						} else {
							witchnode = "endP";		
							
						}
					switch(witchnode){
						case 'startP':
							originmiddlex=(_originP.x+endnode.x)/2;
							originmiddley=(_originP.y+endnode.y)/2;
						break;
						case 'endP':
							originmiddlex=_originP.x+startnode.x;
							originmiddley=_originP.y+startnode.y;
						break;
					}
					if (currentedge.handleInitial===true){
						var tx= (startnode.x+endnode.x)/2;
						var ty=(startnode.y+endnode.y)/2;
						edges[tindex].handleP={x:tx,y:ty};						
					} else {				
						if (currentedge.handleP.x==originmiddlex && currentedge.handleP.y==originmiddley){
							var tx= (startnode.x+endnode.x)/2;
							var ty=(startnode.y+endnode.y)/2;
							edges[tindex].handleP={x:tx,y:ty};	
						} else {							
							edges[tindex].handleP = generate_new_handleP_for_movednode(nodes,edges[tindex], witchnode, _originP);
						}					
					}
					edges[tindex]= update_bcurve2p(nodes,edges[tindex]);
				}else if (edges[tindex].power ===3){
					edges[tindex]= update_bcurve3p(nodes,edges[tindex], edges[tindex].theta, selfpathANGLE_default);
				}
				edges_tangents[tindex]=generate_tangent(nodes,edges[tindex]);
				//for the new labelP:
				// update the label position:
				var _i = matchnodeindex(nodes,edges[tindex].startid);
				var _j = matchnodeindex(nodes,edges[tindex].endid);
				var startP = {x: nodes[_i].x, y:nodes[_i].y};
				var endP= {x: nodes[_j].x, y:nodes[_j].y};
				var handleP = edges[tindex].handleP;
				edges[tindex].labelP = cal_labelP(handleP, startP, endP, edges[tindex].power,labelP_delta_x,labelP_delta_y);
			}
}

function multidrag(_dx,_dy){	
	if(svgstatus.nodeselected==1){
		for(var i=0; i<selectednodeindexes.length;i++){
			var tselectednodeindex=selectednodeindexes[i];
			if(tselectednodeindex >=0 & tselectednodeindex<nodes.length){
				var originP={x:nodes[tselectednodeindex].x, y:nodes[tselectednodeindex].y };
				nodes[tselectednodeindex].x += _dx;
				nodes[tselectednodeindex].y += _dy;
				update_edge_with_moved_node(nodes[tselectednodeindex],originP);
			}
		}		
	}

	if(svgstatus.noteselected==1){
		for(var i=0; i<selectednoteindexes.length;i++){
			var tselectednoteindex=selectednoteindexes[i];
			if(tselectednoteindex >=0 & tselectednoteindex<notes.length){
				notes[tselectednoteindex].x += _dx;
				notes[tselectednoteindex].y += _dy;
			}
		}		
	}
}

//function：OnNodeOnDrag()
function OnNodeOnDrag(thisnode,d,i){
	var currentindex = matchnodeindex(nodes, d.id);
	if (svgstatus.linkingto >= 1){											
		 if( linkinginitialindex != -1){
			svgdragline.x0 = nodes[linkinginitialindex].x;
			svgdragline.y0 = nodes[linkinginitialindex].y;
			svgdragline.x1 = d3.mouse(mysvgG.node())[0];
			svgdragline.y1 = d3.mouse(mysvgG.node())[1];
		} 						
	}else {
		var originx= thisnode.__origin__.x;
		var originy =thisnode.__origin__.y;
		var originP = {x: originx, y: originy};
		newx = thisnode.__origin__.x += d3.event.dx;  
		newy = thisnode.__origin__.y += d3.event.dy; 
		
		if (newx===originx && newy ===originy){
		} else if( d.selected & selectednodeindexes.length>=2){
			multidrag(d3.event.dx,d3.event.dy);
		} else {
			if ( currentindex >=0 && currentindex < nodes.length) {
				nodes[currentindex].x = newx;  
				nodes[currentindex].y = newy;				
			} 
			update_edge_with_moved_node(nodes[currentindex],originP);
		}									
	}
	updatesvg(); 
}

//function: OnNodeOnDragEnd()
function OnNodeOnDragEnd(thisnode,d,i){
	var currentindex = matchnodeindex(nodes, d.id);   
	if(svgstatus.multidraging==1)svgstatus.multidraging=0;
	svgstatus.nodeondragged =0;
}

//function： OnResizedCPOnDrag()
function OnResizedCPOnDrag(thiscP,d,i){
	d.pos.x =  thiscP.__origin__.x += d3.event.dx; 
	d.pos.y = thiscP.__origin__.y += d3.event.dy;  									
	var newcP = {x: d.pos.x, y: d.pos.y};

	var currentnodeindex = matchnodeindex(nodes, d.nodeid);
	var tnode = nodes [currentnodeindex];
	var newr = {rx: tnode.rx, ry: tnode.ry};
	var newrx = tnode.rx;
	var newry = tnode.ry;
	switch (tnode.type){
		case "ellipse":
			{
				switch (d.type){
					case "left":
						{
							var distance = tnode.x - newcP.x;
							var newrx = Math.abs(distance)-2*cPr;
							if (newrx < default_RADIUSH/2) newrx = default_RADIUSH/2;
						}
						break;
					case "right": 
						{
							var distance = newcP.x - tnode.x;
							var newrx = Math.abs(distance)-2*cPr;
							if (newrx < default_RADIUSH/2) newrx = default_RADIUSH/2;
						}
						break;
					case "top":
						{
							var distance = tnode.y -newcP.y;
							var newry = Math.abs(distance)-2*cPr;
							if (newry < default_RADIUSV/2) newry = default_RADIUSV/2;
						}
						break;
					case "bottom": 
						{
							var distance =  newcP.y - tnode.y;
							var newry = Math.abs(distance)-2*cPr;
							if (newry < default_RADIUSV/2) newry = default_RADIUSV/2;
						}													
						break;
					default:;
				
				}
				newr = {rx: newrx, ry: newry};
			}
			break;
		case "rect":
			{
				switch (d.type){
					case "left":
						{
							var distance = tnode.x - newcP.x;
							var newrx = Math.abs(distance)-2*cPr;
							if (newrx < default_RADIUSH/2) newrx = default_RADIUSH/2;
						}
						break;
					case "right": 
						{
							var distance = newcP.x - tnode.x;
							var newrx = Math.abs(distance)-2*cPr;
							if (newrx < default_RADIUSH/2) newrx = default_RADIUSH/2;
						}
						break;
					case "top":
						{
							var distance = tnode.y -newcP.y;
							var newry = Math.abs(distance)-2*cPr;
							if (newry < default_RADIUSV/2) newry = default_RADIUSV/2;
						}
						break;
					case "bottom": 
						{
							var distance =  newcP.y - tnode.y;
							var newry = Math.abs(distance)-2*cPr;
							if (newry < default_RADIUSV/2) newry = default_RADIUSV/2;
						}													
						break;
					default:;
				
				}
				newr = {rx: newrx, ry: newry};
			}
			break;										
		case "triangle":
			{
				switch (d.type){
					case "top":
						{
							var distance = tnode.y - newcP.y;
							var newrx = Math.abs(distance)-2*cPr;
							if (newrx < default_RADIUSH) newrx = default_RADIUSH;
							newry = newrx;
						}
						break;
					case "right_bottom": 
						{
							var distance = Math.sqrt( (tnode.x - newcP.x)*(tnode.x - newcP.x) + (tnode.y - newcP.y)*(tnode.y - newcP.y));
							var newrx = Math.abs(distance)-2*cPr;
							if (newrx < default_RADIUSH) newrx = default_RADIUSH;
							newry = newrx;
						}
						break;
					case "left_bottom":
						{
							var distance = Math.sqrt( (tnode.x - newcP.x)*(tnode.x - newcP.x) + (tnode.y - newcP.y)*(tnode.y - newcP.y));
							var newrx = Math.abs(distance)-2*cPr;
							if (newrx < default_RADIUSH) newrx = default_RADIUSH;
							newry = newrx;
						}
						break;
					default:;
				
				}
				newr = {rx: newrx, ry: newry};
			}
			break;										
		
		default: ;
	}	
	nodes [currentnodeindex].rx = newr.rx;
	nodes [currentnodeindex].ry = newr.ry;
	var relatedindexes = lookfor_relatededges(nodes[currentnodeindex].id);
		for (var i =0; i< relatedindexes.length; i++){
			var tindex = relatedindexes[i];
			if (edges[tindex].power ===2) {
				edges[tindex]= update_bcurve2p(nodes,edges[tindex]);
			}else if (edges[tindex].power ===3){
				edges[tindex]= update_bcurve3p(nodes,edges[tindex], edges[tindex].theta, selfpathANGLE_default);
			}
			edges_tangents[tindex]=generate_tangent(nodes,edges[tindex]);
		}
	updatesvg();  
}

//function: OnPathMouseDown
function OnPathMouseDown(thisPath, d, i){
	var currentindex = i;
	justmousedownedgeindex = currentindex; 
	if (svgstatus.linkingto==1) {
	}
}

//function：OnPathMouseup(){
function OnPathMouseUp(thisPath, d, i){
	var currentindex = i;
	if (svgstatus.linkingto >= 1) { 
		if (linkinginitialindex != -1 ) {	
			linkinginitialindex = -1;
			linkingtargetindex = -1;
			svgdragline.x0=0;svgdragline.y0=0;svgdragline.x1=0;svgdragline.y1=0;
		} 								
											
		svgstatus.linkingto = 0;
	}  else {
		if (svgstatus.texting === 1){
			becurve_text_editing(d,i);
			svgstatus.texting =0;
		}	
		if ( justmousedownedgeindex === currentindex) {  
	
			if (svgstatus.edgeselected === 1) {
				if (selectededgeindex === currentindex) {
					mouseCurrentclicktime= new Date();	
					if (mouseCurrentclicktime - mouseLastclicktime <= 300){
						if (selectededgeindex >=0 && selectededgeindex < edges.length){
							bcurve_text_editing(d,i);
						}
					}
				}						
			} 
			if(svgstatus.nodeselected===1){		if(!d3.event.ctrlKey){	NodesUnselected();	}	}
			if(svgstatus.edgeselected===1){		if(!d3.event.ctrlKey){	EdgesUnselected();	}	}
			if(svgstatus.noteselected===1){		if(!d3.event.ctrlKey){	NotesUnselected();	}	}				
			var foundindexes=findIndexes(selectededgeindexes,currentindex);
			if (foundindexes.length===0) { 
				selectededgeindex = currentindex;
				selectededgeindexes.push(selectededgeindex);	
				edges[selectededgeindex].selected =true; 
				svgstatus.edgeselected = 1;				
			}
			mouseLastclicktime= new Date();			
		} else { 
		//do nothing.
		}
	}
	justmousedownedgeindex=-1;	
	updatesvg();
}

//function： OnHandlePMouseUp()
function OnHandlePMouseUp(thishandle, d, i){
	if (svgstatus.texting === 1){
		bcurve_text_editing(d,i);
		svgstatus.texting =0;
	}
	var currentindex = i;
	if (svgstatus.linkingto >= 1) { 
		if (linkinginitialindex != -1 ) {	
				linkinginitialindex = -1;
				linkingtargetindex = -1;
				svgdragline.x0=0;svgdragline.y0=0;svgdragline.x1=0;svgdragline.y1=0;
		}							
		svgstatus.linkingto = 0;
	}  else { 
		if ( justmousedownedgeindex === currentindex) {

			if (svgstatus.edgeselected === 1) {
				if(selectededgeindex === currentindex){
					mouseCurrentclicktime= new Date();
					if (mouseCurrentclicktime - mouseLastclicktime <= 300){			
						if (selectededgeindex >=0 && selectededgeindex < edges.length){
							bcurve_text_editing(d,i);
						}
					}
				}
			}
			if(svgstatus.nodeselected===1){		if(!d3.event.ctrlKey){	NodesUnselected();	}	}
			if(svgstatus.edgeselected===1){		if(!d3.event.ctrlKey){	EdgesUnselected();	}	}
			if(svgstatus.noteselected===1){		if(!d3.event.ctrlKey){	NotesUnselected();	}	}	
			var foundindexes=findIndexes(selectededgeindexes,currentindex);
			if (foundindexes.length===0) {
				selectededgeindex = currentindex;
				selectededgeindexes.push(selectededgeindex);	
				edges[selectededgeindex].selected =true;
				svgstatus.edgeselected = 1;
			} 
			mouseLastclicktime= new Date();
		} else {				
		}		
	}

	justmousedownedgeindex=-1;	
	updatesvg();	
}

//function： OnLabelMouseDown
function OnLabelMouseDown(thislable,d,i){
	var currentindex = i;
	justmousedownedgeindex = currentindex; 
}
//function： OnLabelMouseUp()
function OnLabelMouseUp(thislabel, d, i){
	if (svgstatus.texting === 1){
		bcurve_text_editing(d,i);
		svgstatus.texting =0;
	}
	var currentindex = i;
	if (svgstatus.linkingto >= 1) { 
		if (linkinginitialindex != -1 ) { 	
			linkinginitialindex = -1;
			linkingtargetindex = -1;
			svgdragline.x0=0;svgdragline.y0=0;svgdragline.x1=0;svgdragline.y1=0;
		} 
		svgstatus.linkingto = 0;
	}  else {
		if ( justmousedownedgeindex === currentindex) {

			if (svgstatus.edgeselected === 1) {
				if (selectededgeindex === currentindex){
					mouseCurrentclicktime= new Date();						
					if (mouseCurrentclicktime - mouseLastclicktime <= 300){
						if (selectededgeindex >=0 && selectededgeindex < edges.length){
							bcurve_text_editing(d,i);
						}
					}
				}
			}
			if(svgstatus.nodeselected===1){		if(!d3.event.ctrlKey){	NodesUnselected();	}	}
			if(svgstatus.edgeselected===1){		if(!d3.event.ctrlKey){	EdgesUnselected();	}	}
			if(svgstatus.noteselected===1){		if(!d3.event.ctrlKey){	NotesUnselected();	}	}	
			var foundindexes=findIndexes(selectededgeindexes,currentindex);
			if (foundindexes.length===0) {
				selectededgeindex = currentindex;
				selectededgeindexes.push(selectededgeindex);
				edges[selectededgeindex].selected =true; 
				svgstatus.edgeselected = 1;
			} 
			mouseLastclicktime= new Date();			
		} 
	}					
	justmousedownedgeindex=-1;
	updatesvg();	
}

//function： OnNoteMouseDown
function OnNoteMouseDown(thisnote,d,i){
	var currentindex = i;
	justmousedownnoteindex = currentindex; 
}
//function： OnNoteMouseUp
function OnNoteMouseUp(thisnote, d, i){
	if (svgstatus.texting === 1){
		note_text_editing(d,i);
		svgstatus.texting =0;
	}
	var currentindex = i;
	if (svgstatus.linkingto >= 1) { 
		if (linkinginitialindex != -1 ) { 	
					linkinginitialindex = -1;
					linkingtargetindex = -1;
					svgdragline.x0=0;svgdragline.y0=0;svgdragline.x1=0;svgdragline.y1=0;
		} 
		svgstatus.linkingto = 0;
	}  else {
		if ( justmousedownnoteindex === currentindex) {

			if (svgstatus.noteselected === 1) {
				if (selectednoteindex ===currentindex){					
					mouseCurrentclicktime= new Date();					
					if (mouseCurrentclicktime - mouseLastclicktime <= 300){							
						if (selectednoteindex >=0 && selectednoteindex < notes.length){
							note_text_editing(d,i);
						}
					}
				}
			}
			if(svgstatus.nodeselected===1){		if(!d3.event.ctrlKey){	NodesUnselected();	}	}
			if(svgstatus.edgeselected===1){		if(!d3.event.ctrlKey){	EdgesUnselected();	}	}
			if(svgstatus.noteselected===1){		if(!d3.event.ctrlKey){	NotesUnselected();	}	}
			var foundindexes=findIndexes(selectednoteindexes,currentindex);
			if (foundindexes.length===0) {
				selectednoteindex = currentindex;
				notes[selectednoteindex].selected =true;
				selectednoteindexes.push(selectednoteindex);	
				svgstatus.noteselected = 1;				
			} 
			mouseLastclicktime= new Date();			
		} 
	}					
	justmousedownnoteindex=-1;		
	updatesvg();
}

//function： Dragmove_for_linking
function Dragmove_for_linking(args){	
	if (svgstatus.linkingto >= 1){
		if (linkinginitialindex !=-1){		 
			 var cordination = d3.mouse(mysvg);
			 svgdragline.x0=nodes[linkinginitialindex].x;
			 svgdragline.y0=nodes[linkinginitialindex].y;
			 svgdragline.x1=cordination[0];
			 svgdragline.y1=cordination[1];
			 updatesvg();
		}
	}
}
//function： OnmysvgMouseDown
function OnmysvgMouseDown(thissvg,d){		
	if(justmousedownnodeindex ===-1 && justmousedownedgeindex ===-1 && justmousedownnoteindex===-1){

		if (svgstatus.nodeselected ===1) {			
			NodesUnselected();//cancel the selected
		}
		if (svgstatus.edgeselected ===1) {
			EdgesUnselected();//cancel the selected
		}
		if (svgstatus.noteselected===1) {
			NotesUnselected();//cancel the selected
		}		
		//to add the free text note
		if(svgstatus.texting===1){
			var tx=d3.mouse(thissvg)[0];
			var ty=d3.mouse(thissvg)[1];
			var currentpos={x:tx, y: ty}; 
			var newnote = note_add(currentpos,"New Note");							
		}
		sethandlePhidden();
		if(d3.event.ctrlKey){
			svgstatus.multipleselecting=1; 
			var tx=d3.mouse(thissvg)[0];
			var ty=d3.mouse(thissvg)[1];
			multipleselectframe.x = tx;
			multipleselectframe.y = ty;				
		}		
	}//end of if(justmousedownnodeindex ===-1 && justmousedownedgeindex ===-1 && justmousedownnoteindex===-1){}
	
	updatesvg();
}
//function： OnmysvgMouseMove
function OnmysvgMouseMove(thissvg,d){
		if(d3.event.ctrlKey && svgstatus.multipleselecting===1){
			var justselectingframe=multipleselectframe;			
			var p = d3.mouse(thissvg);				
			var move = {
					x : p[0] - multipleselectframe.x,
					y : p[1] - multipleselectframe.y
				};			
			if( move.x < 0 || (move.x*2<multipleselectframe.width)) {	
				multipleselectframe.x = p[0];
					multipleselectframe.width -= move.x;  
			} else {
				multipleselectframe.width = move.x;       
			}
			if( move.y < 0 || move.y*2<multipleselectframe.height) {
				multipleselectframe.y = p[1];
					multipleselectframe.height -= move.y;
			} else {
				multipleselectframe.height = move.y;       
			}
					
			var tselectboundary={
				x1:multipleselectframe.x,
				y1:multipleselectframe.y,
				x2:multipleselectframe.x+multipleselectframe.width,
				y2:multipleselectframe.y+multipleselectframe.height
			}; 
			if (tselectboundary.x1 >=0 & tselectboundary.x2<=w & tselectboundary.y1>=0 & tselectboundary.y2<=h){				
			} else {
				multipleselectframe=justselectingframe;
				tselectboundary={
				x1:multipleselectframe.x,
				y1:multipleselectframe.y,
				x2:multipleselectframe.x+multipleselectframe.width,
				y2:multipleselectframe.y+multipleselectframe.height
				};
			}
			
			if(svgstatus.nodeselected===1){NodesUnselected();}
			if(svgstatus.edgeselected===1){EdgesUnselected();}
			if(svgstatus.noteselected===1){NotesUnselected();}
			
			for (var i=0; i<nodes.length;i++){
				var tnodeboundary={
					x1:nodes[i].x-nodes[i].rx,
					y1:nodes[i].y-nodes[i].ry,
					x2:nodes[i].x+nodes[i].rx,
					y2:nodes[i].y+nodes[i].ry
				}			
				if (tnodeboundary.x1>=tselectboundary.x1 && tnodeboundary.x2<=tselectboundary.x2 && tnodeboundary.y1 >= tselectboundary.y1 && tnodeboundary.y2 <= tselectboundary.y2 )	{
					nodes[i].selected=true;
					selectednodeindexes.push(i);
					selectednodeindex=i;
					svgstatus.nodeselected=1;
				}				
			}	
			//select the edges
			for (var i=0; i<edges.length;i++){
				var startnodeid='';
				var endnodeid='';
				switch(edges[i].power){
					case 2: startnodeid=edges[i].startid; endnodeid=edges[i].endid;
					break;
					case 3:startnodeid=edges[i].nodeid; endnodeid=edges[i].nodeid;
					break;
				}
				var startnode=nodes[matchnodeindex(nodes,startnodeid)];
				var endnode=nodes[matchnodeindex(nodes,endnodeid)];
				var tedgeboundary={
					x1:startnode.x,
					y1:startnode.y,
					x2:endnode.x,
					y2:endnode.y,
					x3:edges[i].handleP.x,
					y3:edges[i].handleP.y
				}			
				if (tedgeboundary.x1>=tselectboundary.x1 && tedgeboundary.x1<=tselectboundary.x2
							&& tedgeboundary.y1 >= tselectboundary.y1 && tedgeboundary.y1 <= tselectboundary.y2 
							&& tedgeboundary.x2 >= tselectboundary.x1 && tedgeboundary.x2 <= tselectboundary.x2
							&& tedgeboundary.y2 >= tselectboundary.y1 && tedgeboundary.y2 <= tselectboundary.y2 
							&& tedgeboundary.x3 >= tselectboundary.x1 && tedgeboundary.x3 <= tselectboundary.x2
							&& tedgeboundary.y3 >= tselectboundary.y1 && tedgeboundary.y3 <= tselectboundary.y2)	{
					edges[i].selected=true;
					selectededgeindexes.push(i);
					selectededgeindex=i;
					svgstatus.edgeselected=1;
				}				
			}
			//select the notes
			for (var i=0; i<notes.length;i++){
				var tnoteboundary={
					x1:notes[i].x-notes[i].rx,
					y1:notes[i].y-notes[i].ry,
					x2:notes[i].x+notes[i].rx,
					y2:notes[i].y+notes[i].ry
				}			
				if (tnoteboundary.x1>=tselectboundary.x1 && tnoteboundary.x2<=tselectboundary.x2 && tnoteboundary.y1 >= tselectboundary.y1 && tnoteboundary.y2 <= tselectboundary.y2 )	{
					notes[i].selected=true;
					selectednoteindexes.push(i);
					selectednoteindex=i;
					svgstatus.noteselected=1;
				}				
			}
			updatesvg();
		} else {			
		}	
}
//function： OnmysvgMouseUp
function OnmysvgMouseUp(thissvg,d){
	if (svgstatus.linkingto >= 1) { 								
		linkinginitialindex = -1;
		linkingtargetindex = -1;
		svgdragline.x0=0;svgdragline.y0=0;svgdragline.x1=0;svgdragline.y1=0;																				
		svgstatus.linkingto = 0;
	} else if (svgstatus.texting ===1){
		svgstatus.texting =0;				
	} else if (justmousedownedgeindex >= 0){
		justmousedownedgeindex = -1;						
	} else if (justmousedownnodeindex >= 0){
		justmousedownnodeindex = -1;
	} else if (justmousedownnoteindex>=0){
		justmousedownnoteindex=-1;
	} 
	if (svgstatus.multipleselecting===1){
		multipleselectframe.x = 0;
		multipleselectframe.y = 0;
		multipleselectframe.width= 0;
		multipleselectframe.height= 0;
		svgstatus.multipleselecting = 0;			
	}			
	svgstatus.nodeondragged = 0;
	svgstatus.svgondragged = 0;
	updatesvg();								
}

//function： OnmysvgMouseOut
function OnmysvgMouseOut(thissvg,d){

}

//function： OnmysvgOnDrag
function OnmysvgOnDrag(thissvg,d){
	/*if (svgstatus.linkingto >= 1){	//handle the linkingto effects										
		 if( linkinginitialindex != -1) {
			svgdragline.x0 = nodes[linkinginitialindex].x;
			svgdragline.y0 = nodes[linkinginitialindex].y;
			svgdragline.x1 = d3.mouse(mysvgG)[0];
			svgdragline.y1 = d3.mouse(mysvgG)[1];
			//Dragmove_for_linking(thissvg,d);
			linkingtempxy = {x0:svgdragline.x0, y0: svgdragline.y0, x1:svgdragline.x1, y1:svgdragline.y1};	
			updatesvg();
		} 						
	}*/
}

//function: to generate the background grids data
function generate_grids(){
	var rownum= h /default_RADIUSV;
	var colnum= w/default_RADIUSH;
	var grids_row = [];
	var grids_col = [];
	for(var i=0; i<rownum; i++){
		var y =i*default_RADIUSV;
		var p1= {x:0,y:y};
		var p2={x:w,y:y};
		var newline={P1:p1, P2:p2};
		grids_row.push(newline);
	}
	for(var j=0; j<colnum; j++){
		var x =j*default_RADIUSH;
		var p1= {x:x,y:0};
		var p2={x:x,y:h};
		var newline={P1:p1, P2:p2};
		grids_col.push(newline);
	}
	return {grids_row:grids_row, grids_col:grids_col};
}

//function： the svg printing and the svg mouse event functions calling
function updatesvg(){
	//remove the olds
	mysvg.selectAll("line").remove();
	mysvg.selectAll("ellipse").remove();
	mysvg.selectAll("rect").remove();
	mysvg.selectAll("polygon").remove();
	mysvg.selectAll("circle").remove();
	mysvg.selectAll("path").remove();
	mysvg.selectAll("text").remove();
	//extract the new data
	ellipsenodes = nodes.filter(function(d){    return d.type == "ellipse";		});
	rectnodes = nodes.filter(function(d){      return d.type == "rect";		});
	trianglenodes = nodes.filter(function(d){      return d.type == "triangle";		});

	//extract the selected elements/nodes to generate the resize control points
	var selectednodes = nodes.filter(function(d){	return d.selected == true;		});
	var resize_cPs = generate_resize_cPs(selectednodes);									
	numRec=rectnodes.length;
	numElli=ellipsenodes.length;
	numTri=trianglenodes.length;
	numNode=nodes.length;
	numEdge=edges.length;

	//draw the background grid
	if(svgstatus.IsShowGrid){
		var grids= generate_grids();
		var grids_row = grids.grids_row;
		var grids_col = grids.grids_col;
		var grids_row_lines = mysvg.selectAll("line.gridrow")
									.data(grids_row);		
			grids_row_lines.enter().append("svg:line")
									.attr("class","line.gridrow")
									.attr("x1",function(d){return d.P1.x})
									.attr("y1",function(d){return d.P1.y})
									.attr("x2",function(d){return d.P2.x})
									.attr("y2",function(d){return d.P2.y})
									.attr("stroke-width","0.5px")
									.attr("stroke","GREY")
									.attr("stroke-dasharray","5,5");		
			grids_row_lines.exit().remove(); 
		var grids_col_lines = mysvg.selectAll("line.gridcol")
									.data(grids_col);
			grids_col_lines.enter().append("svg:line")
									.attr("class","line.gridcol")
									.attr("x1",function(d){return d.P1.x})
									.attr("y1",function(d){return d.P1.y})
									.attr("x2",function(d){return d.P2.x})
									.attr("y2",function(d){return d.P2.y})
									.attr("stroke-width","0.5px")
									.attr("stroke","GREY")
									.attr("stroke-dasharray","5,5");		
			grids_col_lines.exit().remove(); 									
	}
	///////////////////////////////////////////////////////////////////////////////////////////////
	//the layer1 on mysvg
	mysvgG = mysvg.append("svg:g")
					.attr("id","mysvgG");
					
	//////////////////////////////////////////////////////////////////////////////////////////////
	//begin drawing the paths
	paths = mysvgG.selectAll("path.Gs")
			.data(edges);
	pathGs= paths.enter().append("svg:g")
						.attr("class","path.Gs");						
	pathGs.on("mouseover", function(d,i){ 						
						d.handlePshow = true;			
						d3.select("#handle"+i).attr("fill", backgroundCOLOR).attr("stroke",defaultCOLOR);
					})
		.on("mouseout", function(d,i){ 
						if (! d.selected) {
							d.handlePshow =false;
						}						
						if(! d.selected){	d3.select("#handle"+i).attr("fill", "none").attr("stroke","none");	}						
					})
		.on("mousedown", function(d,i){				
						OnPathMouseDown(this, d, i);				
					})       
		.on("mouseup", function(d,i){					
						OnPathMouseUp(this, d, i); 
					});
		
		//the arrow at interPoint1
	pathGs.append("svg:path")
		.attr("d",function(d,i){  return edges_tangents[i].tangentline1;})
		.attr("class","path.Arrow1")
		.attr("id", function(d,i){ return "patharrow1"+i;})
		.attr("fill","none")
		.attr("stroke","WHITE")
		.attr("stroke-width",function(d,i){ if (edges[i].selected) {return (d.strokewidth *4/3)+"px";}else {return d.strokewidth+"px";} })
		.style("opactic", "100%")
		.style("marker-end", function(d){ 
						var temp="url(#endarrow)";
						var arrowurl="url(#endarrow"+d.color+")";
						switch (d.type)	{						
							case "bi": temp=arrowurl; break;
							case "uni": temp = "url(#arrowfake)"; break;
							default: ;
						}
						return temp;						
					});
	//the arrow at interPoint2
	pathGs.append("svg:path")
		.attr("d",function(d,i){return edges_tangents[i].tangentline2;})
		.attr("class","path.Arrow2")
		.attr("id", function(d,i){ return "patharrow2"+i;})
		.attr("fill","none")
		.attr("stroke","WHITE")
		.attr("stroke-width",function(d,i){ if (edges[i].selected) {return (d.strokewidth * 4/3)+"px";}else {return d.strokewidth+"px";} })
		.style("opactic", "100%")
		.style("marker-end", function(d){var arrowurl="url(#endarrow"+d.color+")"; return arrowurl;});
	//the path itself
	 pathGs.append("svg:path")
		.attr("d",function(d){return d.line;})
		.attr("class","path.link")
		.attr("fill","none")
		.attr("stroke",function(d,i){
				return d.color;
			})
		.attr("stroke-width",function(d,i){
				if (edges[i].selected) {return (d.strokewidth*5/2)+"px";}else {return d.strokewidth+"px";}
			})
		.attr("stroke-dasharray", function(d){
						var temp;
						switch (d.dotted){
							case 0: temp = "none";break;
							case 1: temp ="5,5"; break;
							default: temp="none";
						}
						return temp;
					})
		.style("opactic", "1")	;

	paths.exit().remove(); 	
	//end drawing the paths
	
	//////////////////////////////////////////////////////////////////////////////////
	// handleP
	handlePs = mysvgG.selectAll("circle.handle")
			.data(edges);
	handlePs.enter().append("svg:circle")
		.attr("class", "circle.handle")
		.attr("id", function(d,i){return "handle"+i;})
		.attr("cx",function(d){return d.handleP.x;})
		.attr("cy",function(d){return d.handleP.y;})
		.attr("r", function(d,i) {
						if (selectededgeindex === i) return String((cPr*1.5));
						return String(cPr);
					})
		.attr("stroke", function(d,i) {
						if(d.handlePshow | d.selected) { 
							return defaultCOLOR;
						} else { 
								return "none";
						}
					})
		.attr("fill", function (d) {
						if (d.handlePshow | d.selected) {
							return backgroundCOLOR;
						} else {return "none";} 
					})		
		.on("mouseover", function(d,i){
						d3.select("#handle"+i).attr("stroke",defaultCOLOR)
											.attr("fill",defaultCOLOR);
						d.handlePshow = true;
					})
		.on("mouseout",function(d,i){
						if (selectededgeindex===i){
							d3.select("#handle"+i).attr("stroke",defaultCOLOR)
											.attr("fill",backgroundCOLOR);
						} else {
							d3.select("#handle"+i).attr("stroke","none")
												.attr("fill","none");
							d.handlePshow = false;
						}
					})
		.on("mousedown", function(d,i){
						var currentindex = i;
						justmousedownedgeindex = currentindex; 
					})
		.on("mouseup", function(d,i){	
						OnHandlePMouseUp(this, d, i);
					})
		.call(
			d3.behavior.drag()
				.on("dragstart",function(d,i){   
								this.__origin__ = {x:d.handleP.x, y:d.handleP.y};
								labelP_delta_x = d.labelP.x-d.handleP.x; //for the new labelP: mark down the relative position
								labelP_delta_y = d.labelP.y-d.handleP.y;//for the new labelP								
							})
				.on("drag", function(d,i){      
								var originx = this.__origin__.x;
								var originy = this.__origin__.y;
								d.handleP.x =  this.__origin__.x += d3.event.dx; 
								d.handleP.y = this.__origin__.y += d3.event.dy;  
								if(d.handleP.x === originx && d.handleP.y === originy){
								}else {
									d.handleInitial = false;	
									var newhandleP = d.handleP;
									edges[i].handleP= newhandleP;	
									edges[i] = update_bcurve(nodes,edges[i]);
									edges_tangents[i] = generate_tangent(nodes,edges[i]);
									//for the new labelP:// update the label position:
									var _i = matchnodeindex(nodes,edges[i].startid);
									var _j = matchnodeindex(nodes,edges[i].endid);
									var startP = {x: nodes[_i].x, y:nodes[_i].y};
									var endP= {x: nodes[_j].x, y:nodes[_j].y};
									var handleP = edges[i].handleP;
									edges[i].labelP = cal_labelP(handleP, startP, endP, edges[i].power,labelP_delta_x,labelP_delta_y);									
									updatesvg();  
								}
							})
      			 .on("dragend", function(d){
      						 delete this.__origin__; 
      						})
			);
			
	handlePs.exit().remove();

	////////////////////////////////////////////////////////////////////////////////////
	//labels for paths
	labelTs = mysvgG.selectAll("text.label")
				.data(edges);
	labelTs.enter().append("svg:text")
		.attr("class","text.label")
		.attr("id",function(d,i){return "label"+i;})
		.attr("text-anchor","middle")
		.attr("font-size", function(d,i){ 
							if( selectededgeindex === i) {var highlightFsize = d.labelFsize + 5; return highlightFsize+"pt";}
							return d.labelFsize+"pt";
						})
		.attr("stroke", function(d,i) {
						if(svgstatus.IsShowLabels){
							return "none";
						} else {
							return "none";
						}
					})
		.attr("fill", function(d,i) {
						if(svgstatus.IsShowLabels){
							return defaultCOLOR;
						} else {
							return "none";
						}
					})
		.attr("dx", function(d){return d.labelP.x;})
		.attr("dy", function(d){return d.labelP.y;})
		.text(function(d,i) {return d.label;})
		.on("mouseover", function(d,i){
						d3.select("#label"+i).attr("stroke","#888888");
					})
		.on("mouseout", function(d,i){
						d3.select("#label"+i).attr("stroke","none");
					})
						
		.on("mousedown", function(d,i){
						OnLabelMouseDown(this,d,i);
					})
		.on("mouseup", function(d,i){
						OnLabelMouseUp(this, d, i);
					})
		.call(
			d3.behavior.drag()
				.on("dragstart",function(d){   
								this.__origin__ = {x:d.labelP.x, y:d.labelP.y};
							})
				.on("drag", function(d,i){      
								d.labelP.x =  this.__origin__.x += d3.event.dx;  
								d.labelP.y = this.__origin__.y += d3.event.dy;  
								updatesvg();  
							})
      			 .on("dragend", function(d){
								delete this.__origin__; 
      						})
			);
	
	labelTs.exit().remove();	

		

	/////////////////////////////////////////////////////////////////////////////////////////
	//nodes rects			
	rects = mysvg.selectAll("rect.Gs")
			.data(rectnodes);
	rectGs= rects.enter().append("svg:g")
					.attr("class","rect.Gs");
	rectGs.style("stroke",function(d){return d.color})
		.attr("id", function(d){return "node"+d.id})
		.on("mouseover", function(d){ 
			      		d3.select("#rect"+d.id).attr("fill","#FFEEEE");
					})
		.on("mouseout", function(d){
						d3.select("#rect"+d.id).attr("fill",backgroundCOLOR);
					})
		.on("mousedown", function(d,i){
						OnNodeMouseDown(this, d, i);
					})
		.on("mouseup",  function(d,i){ OnNodeMouseUp(this,d,i);})			
		.call(
			d3.behavior.drag()
				.on("dragstart",function(d,i){
								svgstatus.nodeondragged=1;					
								this.__origin__ = {x:d.x, y:d.y};
								OnNodeOnDragStart(this,d,i);			
							})
				.on("drag", function(d,i){
								OnNodeOnDrag(this,d,i);
							})
      			.on("dragend", function(d,i){								
								delete this.__origin__; 
								OnNodeOnDragEnd(this,d,i);
								if (svgstatus.nodeondragged===1) svgstatus.nodeondragged=0;
							})
			);

	rectGs.append("svg:rect")
		.attr("class", "rect.node")
		.attr("id",function(d){return "rect"+d.id;})
		.attr("x",function(d){return String(d.x-d.rx);})
		.attr("y",function(d){return String(d.y-d.ry);})
		.attr("width",function(d){return String(d.rx*2);})
		.attr("height",function(d){return String(d.ry*2);})
		.attr("fill","WHITE")
		.attr("stroke",function(d){return d.color;})
		.attr("stroke-dasharray", function(d){
						var temp;
						switch (d.strokedotted)	{
							case 0: temp = "none";break;
							case 1: temp ="5,5"; break;
							default: temp="none";
						}
						return temp;
					})
		.attr("stroke-width",function(d){
						if (d.selected) {return (d.strokewidth+3)+"px"; }else{return d.strokewidth+"px";}
					});
		
	rectGs.append("svg:text")
		.attr("class", "text.node")
		.attr("text-anchor","middle")
		.attr("font-size", function(d){if (d.fontsize) {return d.fontsize+"pt";} else {return (10 +"pt");} })
		.attr("stroke","none")
		.attr("fill",defaultCOLOR)
		.attr("dx", function(d){return d.x;})
		.attr("dy", function(d){return d.y + d.fontsize/2;})
		.text(function(d,i) {return d.title;});	
	rects.exit().remove();		
	
	//////////////////////////////////////////////////////////////////////////////////////////
	//nodes ellipses	
	ellipses = mysvg.selectAll("ellipse.Gs")
			.data(ellipsenodes);
	ellipseGs= ellipses.enter().append("svg:g")
									.attr("class","ellipse.Gs");
	ellipseGs.style("stroke",function(d){return d.color})
		.attr("id", function(d){return "node"+d.id})
		.on("mouseover", function(d){ 
			      		d3.select("#ellipse"+d.id).attr("fill","#FFEEEE");
					})
		.on("mouseout", function(d){
						 d3.select("#ellipse"+d.id).attr("fill",backgroundCOLOR);
					})
		.on("mousedown", function(d,i){
						OnNodeMouseDown(this, d,i);
						})
		.on("mouseup", function(d,i){
						OnNodeMouseUp(this,d,i);
					})			
		.call(
			d3.behavior.drag()
				.on("dragstart",function(d,i){
								svgstatus.nodeondragged=1;
								this.__origin__ = {x:d.x, y:d.y};
								OnNodeOnDragStart(this,d,i);
							})
				.on("drag", function(d,i){
								OnNodeOnDrag(this,d,i);
							})
      			.on("dragend", function(d,i){							
								delete this.__origin__; 
								OnNodeOnDragEnd(this,d,i);
								if (svgstatus.nodeondragged===1) svgstatus.nodeondragged=0;

							})
			);
		
	ellipseGs.append("svg:ellipse")
		.attr("class", "ellipses.node")
		.attr("id",function(d){return "ellipse"+d.id;})
		.attr("cx",function(d){return d.x;})
		.attr("cy",function(d){return d.y;})
		.attr("rx",function(d){return d.rx;})
		.attr("ry",function(d){return d.ry;})
		.attr("fill","WHITE")
		.attr("stroke",function(d){return d.color;})
		.attr("stroke-dasharray", function(d){
						var temp;
						switch (d.strokedotted)	{
							case 0: temp = "none";break;
							case 1: temp ="5,5"; break;
							default: temp="none";
						}
						return temp;
					})
		.attr("stroke-width",function(d,i) {
						if (d.selected) {return (d.strokewidth+3)+"px"; }else{return d.strokewidth+"px";}
					});

	ellipseGs.append("svg:text")
		.attr("class", "text.node")
		.attr("text-anchor","middle")
		.attr("font-size", function(d){if (d.fontsize) {return d.fontsize+"pt";} else {return (10 +"pt");} })
		.attr("stroke","none")
		.attr("fill",defaultCOLOR)
		.attr("dx", function(d){return d.x;})
		.attr("dy", function(d){return d.y + d.fontsize/2;})
		.text(function(d,i) {return d.title;});
		
	ellipses.exit().remove();
	
	/////////////////////////////////////////////////////////////////////////////////////////
	//nodes triangles
	triangles = mysvg.selectAll("triangle.Gs")
			.data(trianglenodes);
	triangleGs= triangles.enter().append("svg:g")
					.attr("class","triangle.Gs");
	triangleGs.style("stroke",function(d){return d.color})
		.attr("id", function(d){return "node"+d.id})
		.on("mouseover", function(d){ 
			      		d3.select("#triangle"+d.id).attr("fill","#FFEEEE");									
					})
		.on("mouseout", function(d){
						d3.select("#triangle").attr("fill",backgroundCOLOR);
					})
		.on("mousedown", function(d,i){
						OnNodeMouseDown(this, d, i);
					})
		.on("mouseup",  function(d,i){ OnNodeMouseUp(this,d,i);})			
		.call(
			d3.behavior.drag()
				.on("dragstart",function(d,i){ 
								svgstatus.nodeondragged=1;
								this.__origin__ = {x:d.x, y:d.y};
								OnNodeOnDragStart(this,d,i);
							})
				.on("drag", function(d,i){
								OnNodeOnDrag(this,d,i);				
							})
      			.on("dragend", function(d,i){		
								delete this.__origin__; 
								OnNodeOnDragEnd(this,d,i);
								if (svgstatus.nodeondragged===1) svgstatus.nodeondragged=0;
							})
			);		
			
	triangleGs.append("svg:polygon")
		.attr("id",function(d){return "triangle"+d.id;})
		.attr("points", function (d) {
						var p1 = { x: d.x - d.rx*Math.sqrt(3)/2, y: d.y+d.rx/2 };
						var p2 = { x: d.x + d.rx*Math.sqrt(3)/2, y: d.y+d.rx/2 };
						var p3 = { x: d.x, y: d.y - d.ry};
						temp = p1.x+","+p1.y+" "+p2.x+","+p2.y+" "+p3.x+","+p3.y +" "+p1.x+","+p1.y;
						return temp;
					})
		.attr("class", "polygon.triangle")
		.attr("fill","WHITE")
		.attr("stroke",function(d){return d.color;})
		.attr("stroke-dasharray", function(d){
						var temp;
						switch (d.strokedotted)	{
							case 0: temp = "none";break;
							case 1: temp ="5,5"; break;
							default: temp="none";
						}
						return temp;
					})
		.attr("stroke-width",function(d){
						if (d.selected) {return (d.strokewidth+3)+"px"; }else{return d.strokewidth+"px";}
					});
		
	triangleGs.append("svg:text")
		.attr("class", "text.node")
		.attr("text-anchor","middle")
		.attr("font-size", function(d){if (d.fontsize) {return d.fontsize+"pt";} else {return (10 +"pt");} })
		.attr("stroke","none")
		.attr("fill",defaultCOLOR)
		.attr("dx", function(d){return d.x;})
		.attr("dy", function(d){return d.y  + d.fontsize/2;})
		.text(function(d,i) {return d.title;});	
					
	triangles.exit().remove();

	


	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//begin of resizecPs
	var resizecPs = mysvg.selectAll("circle.resizecP")
			.data(resize_cPs);
	resizecPs.enter().append("svg:circle")
		.attr("class", "circle.resizecPe")
		.attr("id", function(d,i){return "rcP"+i;})
		.attr("cx",function(d){return d.pos.x})
		.attr("cy",function(d){return d.pos.y;})
		.attr("r",String(cPr))
		.attr("stroke", defaultCOLOR)
		.attr("fill", backgroundCOLOR)
		.on("mouseover", function(d,i){
						d3.select("#rcP"+i).attr("fill", defaultCOLOR);
					})
		.on("mouseout", function(d,i){	
						d3.select("#rcP"+i).attr("fill", backgroundCOLOR);		
					})
		.on("mousedown", function(d,i){
						var currentnodeindex = matchnodeindex(nodes, d.nodeid);
						justmousedownnodeindex = currentnodeindex;
					})
		.on("mouseup", function(d,i){
						var currentnodeindex = matchnodeindex(nodes, d.nodeid);
						if (justmousedownnodeindex == currentnodeindex){
							justmousedownnodeindex=-1;
							svgstatus.nodeselected=1;
							selectednodeindex =currentnodeindex;// select node action
							nodes[selectednodeindex].selected=true;
							updatesvg();
						}
					})
		.call(
			d3.behavior.drag()
				.on("dragstart",function(d){   
								this.__origin__ = {x:d.pos.x, y:d.pos.y};
							})
				.on("drag", function(d,i){      
								OnResizedCPOnDrag(this,d,i);
							})
      			 .on("dragend", function(d){
								delete this.__origin__; 
      						})
			);
		
	resizecPs.exit().remove();		
	// end of resize controlPs/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//begin the free texts:
	noteTs = mysvgG.selectAll("text.note")
				.data(notes);
	noteTs.enter().append("svg:text")
		.attr("class","text.note")
		.attr("id",function(d,i){return "note"+i;})
		.attr("text-anchor","middle")
		.attr("font-size", function(d,i){ 
						if( selectednoteindex === i) {var highlightFsize = d.fontsize + 5; return highlightFsize+"pt";}
						return d.fontsize+"pt";
					})
		.attr("stroke", function(d,i) {	return "none";	})
		.attr("fill", function(d,i) {	return d.color;})
		.attr("dx", function(d){return d.x;})
		.attr("dy", function(d){return d.y;})
		.text(function(d,i) {return d.text;})
		.on("mouseover", function(d,i){
						d3.select("#note"+i).attr("stroke","#888888");
					})
		.on("mouseout", function(d,i){
						d3.select("#note"+i).attr("stroke","none");
					})						
		.on("mousedown", function(d,i){
						OnNoteMouseDown(this,d,i);
					})
		.on("mouseup", function(d,i){
						OnNoteMouseUp(this, d, i);
					})
		.call(
			d3.behavior.drag()
				.on("dragstart",function(d){   
								this.__origin__ = {x:d.x, y:d.y};
							})
				.on("drag", function(d,i){      
								d.x =  this.__origin__.x += d3.event.dx;  
								d.y = this.__origin__.y += d3.event.dy;  
								updatesvg();  
							})
      			 .on("dragend", function(d){
								delete this.__origin__; 
      						})
			);
	
	noteTs.exit().remove();		
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var tempG= mysvgG.append("svg:g");
	mysvgG_foreignObject = tempG.append("svg:g")
					.attr("id","mysvgG_foreignObject");	
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//linking path
	if (svgstatus.linkingto>=1){
		tline = "M"+ svgdragline.x0 + " " + svgdragline.y0 + " " + "L" + svgdragline.x1+" " + svgdragline.y1 ;
		linkingpath = mysvgG.append("svg:path")
			.attr("class","path.linking")
			.attr("d",tline)
			.attr("fill","none")
			.attr("stroke","BLACK")
			.attr("stroke-width","2px")
			.attr("stroke-dasharray", "none")
			.style("opactic", "1")
			.style("marker-end", "url(#endarrow)")
			.style("marker-start", function(d){if (linkingtoArrowTYPE==="bi") {return "url(#beginarrow)";} else {return "url(#arrowfake)";}});
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//multiple selecting:
	if(svgstatus.multipleselecting===1){
		mysvg.append('svg:rect')
			.attr("class",'selecting')
			.attr( "x",multipleselectframe.x)
			.attr("y",multipleselectframe.y)
			.attr("width", multipleselectframe.width)
			.attr("height", multipleselectframe.height)
			.attr("fill", 'transparent')
			.attr("stroke","#8888BB")
			.attr("stroke-dasharray",'5,5')
			.attr("stroke-width","1.5 px");
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	mysvg.on("mousedown", function(d){					
					OnmysvgMouseDown(this,d);	
				})
		.on("mouseup", function(d){					
					OnmysvgMouseUp(this,d);
				})
		.on("mouseout", function(d){	
					OnmysvgMouseOut(this,d);
				});
	if (svgstatus.linkingto === 0){
		mysvg.on("mousemove", function(d){
					OnmysvgMouseMove(this,d);
				})
	}
	
	////////////////////////////////////////////////////////////////////////////////////////
	//Update the matrix in the menubar
	//console.log(GraphToText1());
	document.getElementById("submatrix").innerHTML = GraphToText1();
	document.getElementById("submatrix").height = 8*2*(edges.length+1);
} // end of function updatesvg(){}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
