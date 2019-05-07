<?php
header("content-type: text/xml");

// read the xml file into a dom structure
$xml = new DOMDocument();
$xml->preserveWhiteSpace = false; // remove whitespace nodes 
$xml->load("leaderbroad.xml");

// retrieve the get request values
$name = $_GET["name"];
$score = $_GET["score"];


echo $xml->saveXML();
?>
