<html>
<body>

<?php
if ($_POST){
    
    if ($_POST['passwd'] == "JohnnyYuJiao"){
    
        $dir = '/var/www/semdiaggit/semdiag-paper';
        chdir($dir);

        $pullgit = shell_exec('/usr/bin/git pull  2>&1');
		
		$cmd = ' cp -R /var/www/semdiaggit/semdiag-paper/Code/. /www/psychstat/semdiag.psychstat.org/.';
		shell_exec($cmd);

        echo "semdiag.psychstat.org was updataed! <br />";
        echo "<pre>";
        echo $pullgit;
        echo "</pre>";
    
        if (isset($_POST['email']) && $_POST['email'] == "yes"){
          //send email to the group
            $to      = 'zzhang4@nd.edu,ymai@nd.edu';
    
            $subject = 'WebPower updated';
            $message = $pullgit;
            $headers = 'From: mathfeud@psychstat.org' . "\r\n" . 'Reply-To: mathfeud@psychstat.org' . "\r\n";

            mail($to, $subject, $message, $headers);
        }
    }else{
        echo "The password is not correct!";   
    }
}
?>

<form action="index.php" method="post">
Click the submit button will update the live website. Be careful of uisng it.
<br /> <br />

Password <input type="text" name="passwd"><br>
<br /> <br />

<input type="checkbox" name="email" value="yes">Send email<br>
<br /> <br />

<input type="submit" name='form' value='Submit'>
</form>

</body>
</html>