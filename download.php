<?php
/***************************************************
 * semdiag: draw SEM path diagram interactively    *
 * Authors: Yujiao Mai, Zhiyong Zhang, Ke-Hai Yuan *
 * Copyright 2015-2015, psychstat.org              *
 * Licensed under the MIT License (MIT)            *
 * Current software version 1.0                    *
 * Support email for questions zzhang4@nd.edu      *
 *                             ymai@nd.edu         * 
 ***************************************************/
?>
<?php
session_start();
$filename = $_POST["filename"];
$filetype = $_POST["filetype"];
$filecontent = $_POST["filecontent"];
if ($filename==""){
	$filename = "diagram".".".$filetype;
}else{
	$filename = $filename.".".$filetype;
}
$filecontent = $_POST['filecontent'];
switch($filetype){
	case 'svg':
		header('Content-type: image/svg+xml');
	break;
	case 'diag':
		header('Content-Type: text/plain');
	break;
}
header("Content-disposition: attachment; filename='".$filename."'");
echo $filecontent;
?>