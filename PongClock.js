var fieldTop;
var fieldBottom;
var fieldLeft;
var fieldRight;
var fieldMissLeft;
var fieldMissRight;
var ballLeft;
var ballTop;
var ballReturn;			// false if the hour or minute needs to be advanced (i.e., that the other side should miss)
var ballMovement;
var ballHorizontal;
var ballVertical;
var paddleZone;
var paddleJSON;
var hour;
var minutes;


function startClock() {

	var screenHeight = $( window ).height();
	var screenWidth = $( window ).width();
	var fieldHeight = Math.round( Math.min( screenHeight, screenWidth ) * 0.75 );
	var scoreHeight = screenHeight - fieldHeight;
	var scoreUnit = Math.round( Math.min( scoreHeight, screenWidth / 2 ) / 10 );
	var lineWidth = Math.round( fieldHeight * 0.025 );
	var digitWidth = Math.round( lineWidth / 4 );
	var paddleHeight = lineWidth * 5;
	
	// Make everything fit the current screen
	$( "#all" ).css( "height", fieldHeight + "px" );
	$( "#all" ).css( "border-width", lineWidth + "px" );
	$( "#centerLine" ).css( "border-width", lineWidth + "px" );
	$( ".paddle" ).css( "height", paddleHeight + "px" );
	$( ".paddle" ).css( "border-width", lineWidth + "px" );
	$( "#paddleLeft" ).css( "left", ( lineWidth * 2 ) + "px" );
	$( "#paddleRight" ).css( "right", ( lineWidth * 2 ) + "px" );
	$( "#ball" ).css( "height", lineWidth + "px" ).css( "width", lineWidth + "px" );
	$( "#score" ).css( "height", scoreHeight + "px" );
	$( ".scoreDigits" ).css( "margin-top", ( scoreUnit * 2 ) + "px" );
	$( ".scoreColumnDigit" ).css( "width", ( scoreUnit * 2 ) + "px" );
	$( ".scoreColumnSpace" ).css( "width", scoreUnit + "px" );
	$( ".scoreDigitsRow" ).css( "height", ( scoreUnit * 2 ) + "px" );
	$( ".hour, .minute" ).css( "border-left-width", ( digitWidth * 2 ) + "px" ).css( "border-right-width", ( digitWidth * 2 ) + "px" );
	$( ".upper" ).css( "border-top-width", ( digitWidth * 2 ) + "px" ).css( "border-bottom-width", digitWidth + "px" );
	$( ".lower" ).css( "border-top-width", digitWidth + "px" ).css( "border-bottom-width", ( digitWidth * 2 ) + "px" );

	if ( $( "html" ).height() < 150 || $( "html" ).width() < 150 ) {
		$( "#showAlert" ).show();
		$( "#showGame" ).hide();
	} else {
		$( "#showAlert" ).hide();
		$( "#showGame" ).show();
	}
	
	var ballHeight = $( "#ball" ).height();
	var ballWidth = $( "#ball" ).width();
	fieldTop = 0;
	fieldBottom = $( "#all" ).height() - ballHeight;
	fieldLeft = $( "#paddleLeft" ).position().left + parseInt( $( "#paddleLeft" ).css( "border-right-width" ) );
	fieldRight = $( "#paddleRight" ).position().left - ballWidth;
	var fieldWidth = fieldRight - fieldLeft;
	fieldMissLeft = -lineWidth;
	fieldMissRight = $( "#all" ).width();
	
	$( "#ball" ).css( "left", ballLeft + "px" ).css( "top", ballTop + "px" );
	
	var secondsToCrossField = 3;
	ballMovement = Math.max( 1, Math.round( ( fieldWidth / 100 ) / ( secondsToCrossField * 2 ) ) );
		// 100 to correlate this value with the setInterval value, which is hard-coded as 10ms.
		// ballVertical is the basic unit of ball movement, from which other values are multiples.
	ballVertical = ballMovement;
	ballHorizontal = ballVertical * 2;
	paddleJSON = {
		"upper miss" :
			{
				"offset" : lineWidth * 2
			},
		"upper edge" :
			{
				"offset" : 0,
				"ballVertical" : -2 * ballMovement
			},
		"upper middle" :
			{
				"offset" : -lineWidth,
				"ballVertical" : -ballMovement
			},
		"middle" :
			{
				"offset" : lineWidth * -2,
				"ballVertical" : 0
			},
		"lower middle" :
			{
				"offset" : lineWidth * -3,
				"ballVertical" : ballMovement
			},
		"lower edge" :
			{
				"offset" : lineWidth * -4,
				"ballVertical" : 2 * ballMovement
			},
		"lower miss" :
			{
				"offset" : lineWidth * -6
			}
	}
	
	AdvanceClock();	

	paddleZone = ChangePaddleZone();

	if ( typeof clockInterval !== "undefined" ) {
		clearInterval( clockInterval );
	}
	clockInterval = setInterval(
		function() {
			MoveAndAdvance();
		},
		10
	);
}

function InitialPlacement() {
	ballLeft = fieldLeft;
	ballTop = Math.round( fieldBottom / 2 );
	$( "#paddleLeft" ).css( "top", ( ballTop + paddleJSON["middle"]["offset"] ) + "px" );
	$( "#paddleRight" ).css( "top", ( ballTop + paddleJSON["middle"]["offset"] ) + "px" );
	ballReturn = true;
}

function MoveAndAdvance() {
	if ( ballTop + ballVertical < fieldTop || ballTop + ballVertical > fieldBottom ) {
		ballVertical = -ballVertical;
	}
	if ( ballReturn == true && ( ballLeft + ballHorizontal < fieldLeft || ballLeft + ballHorizontal > fieldRight ) ) {
		ballHorizontal = -ballHorizontal;
		ballVertical = paddleJSON[paddleZone]["ballVertical"];
		paddleZone = ChangePaddleZone();
	}
	if ( ballReturn == false && ( ballLeft + ballHorizontal < fieldMissLeft || ballLeft + ballHorizontal > fieldMissRight ) ) {
		AdvanceClock();
		paddleZone = ChangePaddleZone();
	}
	ballLeft = ballLeft + ballHorizontal;
	ballTop = ballTop + ballVertical;
	$( "#ball" ).css( "left", ballLeft + "px" ).css( "top", ballTop + "px" );
	MovePaddle();
}

function ChangePaddleZone() {
	var timeNow = new Date();
	if ( ballHorizontal < 0 ) {
		if ( timeNow.getMinutes() != minutes && timeNow.getHours() == hour ) {
			ballReturn = false;
		} else {
			ballReturn = true;
		}
	} else {
		if ( timeNow.getHours() != hour ) {
			ballReturn = false;
		} else {
			ballReturn = true;
		}
	}
	if ( ballReturn == false ) {
		paddleZone = Math.floor((Math.random() * 2) + 1);
		switch ( paddleZone ) {
			case 1:
				return( "upper miss" );
				break;
			case 2:
				return( "lower miss" );
				break;
		}
	} else {
		paddleZone = Math.floor((Math.random() * 5) + 1);
		switch ( paddleZone ) {
			case 1:
				return( "upper edge" );
				break;
			case 2:
				return( "upper middle" );
				break;
			case 3:
				return( "middle" );
				break;
			case 4:
				return( "lower middle" );
				break;
			case 5:
				return( "lower edge" );
				break;
		}
	}
}

function MovePaddle() {
	var activePaddle;
	var activePaddlePosition;
	var pixelsToMovePaddle = 4 * ballMovement;
	if ( ballHorizontal < 0 ) {
		activePaddle = "paddleLeft";
	} else {
		activePaddle = "paddleRight";
	}
	activePaddlePosition = $( "#" + activePaddle ).position().top;
	targetPaddlePosition = ballTop + paddleJSON[paddleZone]["offset"];
	if ( Math.abs( activePaddlePosition - targetPaddlePosition ) <= pixelsToMovePaddle ) {
		newPaddlePosition = targetPaddlePosition;
	} else if ( targetPaddlePosition < activePaddlePosition ) {
		newPaddlePosition = activePaddlePosition - pixelsToMovePaddle;
	} else {
		newPaddlePosition = activePaddlePosition + pixelsToMovePaddle;
	}
	$( "#" + activePaddle ).css( "top", newPaddlePosition + "px" );
}

function AdvanceClock() {
	var timeNow = new Date();
	hour = timeNow.getHours();
	minutes = timeNow.getMinutes();
	ShowDigits( hour, "hour" );
	ShowDigits( minutes, "minute" );
	InitialPlacement();
}

function ShowDigits( value, placement ) {
	valueString = String( value ).slice( -2 );
	if ( valueString.length == 1 ) {
		tensValue = "0"
	} else {
		tensValue = valueString.slice( 0, 1 );
	}
	unitsValue = valueString.slice( -1 );
	ShowDigit( tensValue, "tens", placement );
	ShowDigit( unitsValue, "units", placement );
}

function ShowDigit( value, precision, placement ) {
	thisUpper = "." + placement + "." + precision + ".upper";
	thisLower = "." + placement + "." + precision + ".lower";
	$( thisUpper ).css( "border-style", "none" );
	$( thisLower ).css( "border-style", "none" );
	switch ( value ) {
		case "0":
			$( thisUpper ).css( "border-left-style", "solid" )
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-left-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-bottom-style", "solid" );
			break;
		case "1":
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			break;
		case "2":
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisUpper ).css( "border-bottom-style", "solid" );
			$( thisLower ).css( "border-left-style", "solid" )
			$( thisLower ).css( "border-top-style", "solid" )
			$( thisLower ).css( "border-bottom-style", "solid" );
			break;
		case "3":
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisUpper ).css( "border-bottom-style", "solid" );
			$( thisLower ).css( "border-top-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-bottom-style", "solid" );
			break;
		case "4":
			$( thisUpper ).css( "border-left-style", "solid" )
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisUpper ).css( "border-bottom-style", "solid" );
			$( thisLower ).css( "border-top-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			break;
		case "5":
			$( thisUpper ).css( "border-left-style", "solid" )
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-bottom-style", "solid" );
			$( thisLower ).css( "border-top-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-bottom-style", "solid" );
			break;
		case "6":
			$( thisUpper ).css( "border-left-style", "solid" )
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-bottom-style", "solid" );
			$( thisLower ).css( "border-left-style", "solid" )
			$( thisLower ).css( "border-top-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-bottom-style", "solid" );
			break;
		case "7":
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			break;
		case "8":
			$( thisUpper ).css( "border-left-style", "solid" )
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisUpper ).css( "border-bottom-style", "solid" );
			$( thisLower ).css( "border-left-style", "solid" )
			$( thisLower ).css( "border-top-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-bottom-style", "solid" );
			break;
		case "9":
			$( thisUpper ).css( "border-left-style", "solid" )
			$( thisUpper ).css( "border-top-style", "solid" )
			$( thisUpper ).css( "border-right-style", "solid" )
			$( thisUpper ).css( "border-bottom-style", "solid" );
			$( thisLower ).css( "border-top-style", "solid" )
			$( thisLower ).css( "border-right-style", "solid" )
			$( thisLower ).css( "border-bottom-style", "solid" );
			break;
	}
}