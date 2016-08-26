/***************************************************
 * semdiag: draw SEM path diagram interactively    *
 * Authors: Yujiao Mai, Zhiyong Zhang, Ke-Hai Yuan *
 * Copyright 2015-2015, psychstat.org              *
 * Licensed under the MIT License (MIT)            *
 * Current software version 1.0                    *
 * Support email for questions zzhang4@nd.edu      *
 *                             ymai@nd.edu         * 
 ***************************************************/

/* the file 'edge&nodeMethods_l2.js':  functions for the higher layer operation of the nodes and edges and notes*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//function: to find the index of a given value
function findIndexes(array,value){
	var tempindexes=[];
	for(var i=0; i<array.length; i++){
		if (array[i]===value) tempindexes.push(i);
	}
	return tempindexes;
}
//function: add a new node
function node_add(_pos, _rx, _ry, _fontsize,_type){
	var newnode=null;
	var title_pre = "V";
	switch(_type){
		case "ellipse": title_pre ="F";
			break;
		case "rect": title_pre ="X";
			break;
		case "triangle": title_pre = "1";
			break;
		default:;
	}// end of switch (_type) title_pre
	switch (_type){
		case "ellipse": 
			Nodecurrent_IdNUM++;
			Elli_current_TitleNUM++;			
			newnode = { id: "node"+String(Nodecurrent_IdNUM), type: _type, x:_pos.x, y:_pos.y, rx: default_RADIUSH,ry:default_RADIUSV, strokedotted:0, color: defaultCOLOR, title: title_pre+ Elli_current_TitleNUM, fontsize:defaultFONTSIZE,strokewidth:default_strokeWIDTH, selected: false};
			nodes.push(newnode);
			numElli++;
			numNode++;				
			break;
		case "rect":
			Nodecurrent_IdNUM++;
			Rec_current_TitleNUM++;
			newnode = { id: "node"+String(Nodecurrent_IdNUM), type: _type, x:_pos.x, y:_pos.y, rx: default_RADIUSH,ry:default_RADIUSV, strokedotted:0, color: defaultCOLOR, title: title_pre+ Rec_current_TitleNUM, fontsize:defaultFONTSIZE,strokewidth:default_strokeWIDTH,selected: false};
			nodes.push(newnode);
			numRec++;
			numNode++;				
			break;
		case "triangle":{
			Nodecurrent_IdNUM++;
			newnode = { id: "node"+String(Nodecurrent_IdNUM), type: _type, x:_pos.x, y:_pos.y, rx: default_RADIUSH,ry:default_RADIUSV,  strokedotted:0, color: defaultCOLOR, title: title_pre, fontsize:defaultFONTSIZE,strokewidth:default_strokeWIDTH,selected: false};
			nodes.push(newnode);
			numTri++;
			numNode++;				
			break;
		}
			break;
		default:;
	}//end of switch (_type) 
	return newnode;
}

//function: to delete a node of given index
function node_delete(_nodeindex){
	var currentnode = nodes[_nodeindex];
	var temp = delete_relatededges(currentnode, edges, edges_tangents);
	edges = temp.edges;
	edges_tangents = temp.edges_tangents;
	if(matchnodeindex(nodes,currentnode.id)>= 0 & matchnodeindex(nodes,currentnode.id)< nodes.length){
		switch (currentnode.type){
			case "ellipse": 
				numElli--;
				numNode--;			
				break;
			case "rect":
				numRec--;
				numNode--;				
				break;

			case "triangle":
				numTri--;
				numNode--;
				break;

			default:;
		}//end of switch (_type) 
		nodes.splice(_nodeindex,1);
	}
}

//function: to copy a node
function node_copy(_node){
	var newnode=null;
	if (_node===null){		
	} else {
		newnode=node_add(nodeInitialPos, default_RADIUSH,default_RADIUSV, defaultFONTSIZE, _node.type);
		newnode = { id: newnode.id
					, type: _node.type
					, x:_node.x
					, y:_node.y
					, rx: _node.rx
					,ry:_node.ry
					, strokedotted:_node.strokedotted
					, color: _node.color
					, title: _node.title
					, fontsize:_node.fontsize
					,strokewidth:_node.strokewidth
					, selected: _node.selected
			};
	}
	return newnode;			
}

//function： to delete the illegal edges between two given nodes,  power 2 and power 3
function delete_nonuseedges(_startid,_endid, _newtype){ 
	var numDel = 0;
	switch (_newtype){
		case "uni": 
			{	
				var Isfound =false;
				for(var i =0; i < edges.length; i++){
					if (edges[i].power===2){
						if (edges[i].startid===_startid & edges[i].endid===_endid & edges[i].type ==="bi") {
							edge_delete(i);
							Isfound = true;
						}						
					}
				}
				if (! Isfound) {
					for(var i =0; i < edges.length; i++){
						if (edges[i].power===2){
							if (edges[i].startid===_endid & edges[i].endid===_startid & edges[i].type ==="bi") {								
								edge_delete(i);
								Isfound = true;
							}						
						}
					}
				}
			}			
			break;
		case "bi": 
			{	
				for(var i =0; i < edges.length; i++){
					if (edges[i].power===2){
						if (edges[i].startid===_startid & edges[i].endid===_endid & edges[i].type ==="uni") {
							edge_delete(i);
							numDel++;
						}						
					}
				}
				
				for(var i =0; i < edges.length; i++){
					if (edges[i].power===2){
						if (edges[i].startid===_endid & edges[i].endid===_startid & edges[i].type ==="uni") {
							edge_delete(i);
							numDel++;						
						}						
					}
				}
				var targetnode = nodes[matchnodeindex(nodes,_endid)]; 
				var Is_still_dependentnode = Is_dependentnode(targetnode,nodes,edges);
				if(Is_still_dependentnode){
						
				} else {
					var tempindex = lookfor_duplicatedbcurve(nodes,edges,_endid,_endid,"bi");
					if (tempindex>=0 & tempindex<edges.length) { 
						if(edges[tempindex].IsAutoGenerated==true){ 
							edge_delete(tempindex); 
						}
					}
				}			
			}
			break;
		default: ;
	}
	return numDel;
}

//function: to find the indexes of edges linking to a given node,  power 2 and power 3
function lookfor_relatededges(_nodeid){
	var foundindexes = [];	
	for (var i =0; i< edges.length; i++) {
		if (edges[i].power ===2){
			if (_nodeid === edges[i].startid) foundindexes.push(i);
			if (_nodeid === edges[i].endid)foundindexes.push(i);
		} else if (edges[i].power ===3){
			if (_nodeid === edges[i].nodeid) foundindexes.push(i);
		}
	}	
	return foundindexes;
}

//function: delete an edge of given index in the array edges
function edge_delete(_bcurveindex){
	var Is_sucess=false;
	var _bcurve = edges[_bcurveindex];
	switch (_bcurve.power){
		case 2:{
			switch(_bcurve.type){
				case "uni":{
					var initialnode = nodes[matchnodeindex(nodes,_bcurve.startid)];
					var targetnode = nodes[matchnodeindex(nodes,_bcurve.endid)];
					edges.splice(_bcurveindex,1);
					edges_tangents.splice(_bcurveindex,1);
					var Is_still_dependentnode = Is_dependentnode(targetnode, nodes,edges);
					if (Is_still_dependentnode) {
					} else {
						var tempbcurveindex = lookfor_duplicatedbcurve(nodes,edges,targetnode.id, targetnode.id, "bi");
						if (tempbcurveindex >=0 & tempbcurveindex < edges.length)
						{	
							if (edges[tempbcurveindex].IsAutoGenerated === true){ 
								edges.splice(tempbcurveindex,1);
								edges_tangents.splice(tempbcurveindex,1);
							} else {		
								//do nothing.
							}							
						}
					}
					
					if (initialnode.type === "triangle" ){
						var Is_still_initialnode=false;
						for(var i=0; i< edges.length;i++){
							if (edges[i].power === 2 & edges[i].startid === initialnode.id) Is_still_initialnode=true;
						}						
						if (! Is_still_initialnode) node_delete(matchnodeindex(nodes,initialnode.id));
					}
					Is_sucess=true;
				}
					break;
				case "bi":{
					edges.splice(_bcurveindex,1);
					edges_tangents.splice(_bcurveindex,1);
					Is_sucess=true;
				} 
					break;
				default:{					
					edges.splice(_bcurveindex,1);
					edges_tangents.splice(_bcurveindex,1);
					Is_sucess=true;
				}
			}// end of switch(_bcurve.type)			
		} 
			break;
		case 3: {
			edges.splice(_bcurveindex,1);
			edges_tangents.splice(_bcurveindex,1);
			Is_sucess=true;
		}
			break;
		default:{
			edges.splice(_bcurveindex,1);
			edges_tangents.splice(_bcurveindex,1);
			Is_sucess=true;
		}
	}// end of switch (_bcurve.power)
	return Is_sucess;
}

//function: delete the edges linking to the given node
function delete_relatededges(_node, _edges, _edges_tangents){
	var currentid = _node.id;
	for (var i=0; i<_edges.length; i++){
		var tempedge=edges[i];
		if (_edges[i].power === 2){
			if (_edges[i].startid === currentid || _edges[i].endid === currentid ) {
				if ( edge_delete(i) ) i--;
			}
		} else if (_edges[i].power === 3){								
			if (_edges[i].nodeid === currentid) {
				if ( edge_delete(i) ) i--;
			}
		}
	}
	return {edges: _edges, edges_tangents: _edges_tangents};
}

//function: to add an new bcurve, if it is not duplicate/ existed
function edge_add_newbcurve(_newbcurve){
	var newedgeindex = -1;
	var arrowType = _newbcurve.type;
	switch(_newbcurve.power){
		case 2:{
			var found_index=lookfor_duplicatedbcurve(nodes,edges,_newbcurve.startid,_newbcurve.endid, _newbcurve.type);
			if ( found_index >=0 & found_index < edges.length) {
			} else {  						
				switch( arrowType){
					case "uni":{
						var numofDel = delete_nonuseedges(_newbcurve.startid,_newbcurve.endid, _newbcurve.type);
						edges.push(_newbcurve); numEdge++; Edgecurrent_IdNUM++;
						var newtangent = generate_tangent(nodes,_newbcurve);
						edges_tangents.push(newtangent);	
						newedgeindex = numEdge-1;
					} 
						break;
					case "bi":{
						var numofDel = delete_nonuseedges(_newbcurve.startid,_newbcurve.endid, _newbcurve.type);
						edges.push(_newbcurve); numEdge++; Edgecurrent_IdNUM++;
						var newtangent = generate_tangent(nodes,_newbcurve);
						edges_tangents.push(newtangent);
						newedgeindex = numEdge-1;
					}
						break;
					default:;
				} //end of switch(){}		
			}// end of if ( found_index >=0){}else {}
		}// end of case 2:
			break;
		case 3:{
			var found_index=lookfor_duplicatedbcurve(nodes,edges,_newbcurve.nodeid,_newbcurve.nodeid, _newbcurve.type);
			if ( found_index >=0 & found_index < edges.length) {	
			} else { 					
				edges.push(_newbcurve); numEdge++; Edgecurrent_IdNUM++;
				var newtangent = generate_tangent(nodes,_newbcurve);
				edges_tangents.push(newtangent);	
				newedgeindex = numEdge-1;
			}// end of if ( found_index >=0){}else {}
		}
			break;
		default:;
	} //end of switch(_newbcurve.power)
	return newedgeindex;
}

//function： to add an edge, use the rules, (1)if it is allowed (2) if it needs to add an error/self-curve，that is residual variance
function edge_add(_initialnodeindex, _targetnodeindex, _arrowType){
	var newedgeindex = -1;
	if (_arrowType === "uni") {
		if (_initialnodeindex != _targetnodeindex) { 
				if (nodes[_targetnodeindex].type === "triangle" ) { 
					//do nothing				
				}else {
					var newbcurve= generate_edge(nodes,nodes[_initialnodeindex].id, nodes[_targetnodeindex].id, _arrowType); 					
					newedgeindex = edge_add_newbcurve(newbcurve);
					
					if (nodes[_initialnodeindex].type === "triangle" ) { 	
						//do nothing
					
					} else {
						var newbcurve3p = generate_bcurve3p(nodes, nodes[_targetnodeindex].id,"bi");
						newbcurve3p.IsAutoGenerated=true;						
						edge_add_newbcurve(newbcurve3p);
					}
					
				} //end of if 
			}// end of if (_initialnodeindex != currentindex) when initial linking node was not the same node as the mouseup node
	} else if (_arrowType ==="bi"){ 
		
		if ( (nodes[_targetnodeindex].type === "triangle" & _targetnodeindex !=_initialnodeindex ) || ( nodes[_initialnodeindex].type === "triangle" & _targetnodeindex !=_initialnodeindex ) ){//triangle is not allowed to be correlated node but could have its own error/ bi-arrow curve
			//do nothing
		} else {
				var newbcurve= generate_edge(nodes,nodes[_initialnodeindex].id, nodes[_targetnodeindex].id, _arrowType); //then a new bcurve is generated by startindex and endindex						
				newedgeindex = edge_add_newbcurve(newbcurve); 

		}// end of if (_tartgetnodeindex !=_initialnodeindex){//if it is between two different nodes {} else {}								
	}// end of if (_arrowtype ==="bi")
		
	return newedgeindex;
}

//function: add a new note
function note_add(_Poc,_text){
	Notecurrent_IdNUM++;
	var newnote ={
		id:'note'+Notecurrent_IdNUM
		,x: _Poc.x
		,y: _Poc.y
		,text:_text
		,color:defaultCOLOR
		,fontsize:defaultFONTSIZE
		,selected:false
	};
	notes.push(newnote);
	numnote++;
	return newnote;
}

//function: delete a note of given index
function note_delete(_noteindex){
	if(_noteindex>=0 & _noteindex<notes.length) {
		notes.splice(_noteindex,1);
		numnote--;
	}
}

//function: copy a note
function note_copy(_note){
	var newnote=null;
	if (_note===null){		
	} else {
		var tPoc={x:_note.x,y:_note.y};
		newnote=note_add(tPoc,_note.text);
		newnote ={
			id:newnote.id
			,x: _note.x
			,y: _note.y
			,text:_note.text
			,color:_note.color
			,fontsize:_note.fontsize
			,selected:_note.selected
		};
	}
	return newnote;			
}

//function: to set the handleP hidden
function sethandlePhidden(){
	for (var i=0; i < edges.length; i++){
		edges[i].handlePshow = false;
	}
}

//function： edit text for node
function node_text_editing(d,i){
	texteditdialog('node',d,i);
	updatesvg();
}
//function： edit text for bcurve
function bcurve_text_editing(d,i){
	texteditdialog('edge',d,i);
	updatesvg();
}
//function： edit text for note
function note_text_editing(d,i){
	texteditdialog('note',d,i);
	updatesvg();
}

//function: to create the dialogue for text editing 
function texteditdialog(_objecttype,d,i){
	var _text;
	switch(_objecttype){
		case 'node': 
			_text=[d][0].title;
		break;
		case 'edge':
			_text=[d][0].label;
		break;
		case 'note':
			_text=[d][0].text;
		break;
	}
	var inputstr=_text;
	if ($('#edittextdialog')) $('#edittextdialog').remove();
    var dialog = document.createElement('div'); 
	dialog.id='edittextdialog';	
	dialog.style.color = 'black';
	
	var content = document.createElement('div');
	content.style="width=230px; height=100px";	
	
    var form = document.createElement('form');
	form.id = 'texteditform';
	var input = document.createElement('input');
	input.id='edittextinput';
	input.type = 'text';
    input.name = 'text';															
    input.style="width=200px; height=50px";
	input.contentEditable=true;																
	input.value = _text;
	input.focus();
	var tempvalue=input.value;
	$(input).keydown(function (event){
		if (event.keyCode == 13 || event.witch==13) {	
			tempvalue=input.value;
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
		if (_text != input.value){
			switch(_objecttype){
				case 'node': 
					[d][0].title= input.value;
					//to adapt the node size to the length of the title
					if([d][0].rx <= [d][0].title.length * [d][0].fontsize *0.5) {
						[d][0].rx = [d][0].title.length * [d][0].fontsize * 0.5;
						//to adapt the paths involved this resized node:
						var relatedindexes = lookfor_relatededges([d][0].id);//alert("relatedindexes:"+relatedindexes.length);
						//console.log(relatedindexes);
						for (var j =0; j< relatedindexes.length; j++){
							var tindex = relatedindexes[j];
							if (edges[tindex].power ===2) {
								edges[tindex]= update_bcurve2p(nodes,edges[tindex]);
							}else if (edges[tindex].power ===3){
								edges[tindex]= update_bcurve3p(nodes,edges[tindex], edges[tindex].theta, selfpathANGLE_default);
							}
							edges_tangents[tindex]=generate_tangent(nodes,edges[tindex]); //alert("generate_tangent!");
						}						
					}
				break;
				case 'edge':
					[d][0].label= input.value; [d][0].labelInitial=false;
				break;
				case 'note':
					[d][0].text= input.value;
				break;
			}			
		}
		$(dialog).dialog('close');
		$('#edittextdialog').remove();
		updatesvg();
    });
	content.appendChild(button1);	
	
	var button2 = document.createElement('button');
    button2.innerHTML = 'Cancel';
	button2.id="dialogbuton2";
	button2.styles="margin-left:2px";
    $(button2).click(function () {
        $(dialog).dialog('close');
		$('#edittextdialog').remove();
    });
	content.appendChild(button2);
	
    dialog.appendChild(content); 
	
    //show dialog
    $(dialog).dialog({
        modal: true,
        title: 'Edit Text',
        width: "230",
        height: '130',
	    bgiframe: true,
        closeOnEscape: true,
        draggable: true,
        resizable: true
    });

}