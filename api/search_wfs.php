<?php
//$mysqli = new mysqli('localhost', 'yourUserName', 'yourPassWord', 'yourDatabase');

//$dir = 'sqlite:db/wps.sqlite';
//$dbh  = new PDO('sqlite:/var/www/autocomplete/db/wps.db') or die("cannot open the database");

$db = new SQLite3('/usr/share/pycsw/tests/suites/cite/data/ogcwxs.db');
$text = $db->escapeString($_GET['term']);

$query = "SELECT distinct keyword FROM keywords WHERE keyword LIKE '%$text%' AND type='wfs' ORDER BY keyword ASC LIMIT 10";


$result = $db->query($query);
$json = '[';
$first = true;
while($row = $result->fetchArray())
{
	$keywords = $row['keyword'];
    if (!$first) { $json .=  ','; } else { $first = false; }
	$json .= '{"value":"'.$keywords.'"}';
}
$json .= ']';
echo $json;



?>