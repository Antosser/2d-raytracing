(function(){
	var canvas = $("canvas");
	var ctx = canvas[0].getContext("2d");
	var origin = {x: 20, y: 300};

	var showIntersections = false; 

	canvas.width(innerWidth)
	.height(innerHeight)
	.attr('width', innerWidth)
	.attr('height', innerHeight);

	ctx.lineWidth = 1;

	// Objects
	glassCircles = [
		{x: 200, y: 300, r: 50},
		{x: 350, y: 300, r: 50},
		{x: 450, y: 300, r: 50},
		{x: 500, y: 300, r: 50},
		{x: 1000, y: 300, r: 400},
	];

	var frame = (e, clear=true) => {
		if (clear) {
			ctx.clearRect(0, 0, canvas.width(), canvas.height());
		}
		ctx.fillRect(origin.x - 10, origin.y - 10, 20, 20);

		var ray = {x: origin.x, y: origin.y};
		if (ray.x == e.offsetX && ray.y == ray.offsetY) {
			ray.x -= 1;
		}
		var distanceToMouse = Math.sqrt((ray.x - e.offsetX) ** 2 + (ray.y - e.offsetY) ** 2);
		var directionVector = {x: (e.offsetX - ray.x) / distanceToMouse, y: (e.offsetY - ray.y) / distanceToMouse};

		for (let i = 0; i < glassCircles.length; i++) {
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.arc(glassCircles[i].x, glassCircles[i].y, glassCircles[i].r, 0, 2 * Math.PI);
			ctx.stroke();
		}

		let rays = 0;
		for (let limit = 0; limit < 100; limit++) {
			let intersection = null;
			let reflectionObject = null;
			for (let i = 0; i < glassCircles.length; i++) {

				let u = {x: glassCircles[i].x - ray.x, y: glassCircles[i].y - ray.y};
				//let u1Length = Math.min(directionVector.x / directionVector.x, directionVector.y / directionVector.y);
				let pre_u1 = u.x * directionVector.x + u.y * directionVector.y;
				let u1 = {x: pre_u1 * directionVector.x, y: pre_u1 * directionVector.y};
				let u2 = {x: u.x - u1.x, y: u.y - u1.y};
				let d = Math.hypot(u2.x, u2.y);

				if (d >= glassCircles[i].r) {
					continue;
				}

				let m = Math.sqrt(glassCircles[i].r ** 2 - d ** 2);
				let mVector = {x: m * directionVector.x, y: m * directionVector.y};
				let p1 = {x: ray.x + u1.x - mVector.x, y: ray.y + u1.y - mVector.y};
				let p2 = {x: ray.x + u1.x + mVector.x, y: ray.y + u1.y + mVector.y};

				if (pre_u1 < 0 || p1 == intersection) {
					continue;
				}

				//ctx.fillRect(ray.x + u1.x - 5, ray.y + u1.y - 5, 10, 10);
				if (showIntersections) {
					ctx.fillRect(p1.x - 2, p1.y - 2, 4, 4);
					ctx.fillRect(p2.x - 2, p2.y - 2, 4, 4);
				}

				if (intersection == null || Math.hypot(p1.x - ray.x, p1.y - ray.y) < Math.hypot(intersection.x - ray.x, intersection.y - ray.y)) {
					intersection = p1;
					reflectionObject = glassCircles[i];
				}
			}
			rays++;
			ctx.strokeStyle = "green";
			if (intersection == null) {
				ctx.beginPath();
				ctx.moveTo(ray.x, ray.y);
				ctx.lineTo(ray.x + directionVector.x * 10000, ray.y + directionVector.y * 10000);
				ctx.stroke();
				break;
			}
			//ctx.fillRect(intersection.x - 5, intersection.y - 5, 10, 10);
			ctx.beginPath();
			ctx.moveTo(ray.x, ray.y);
			ctx.lineTo(intersection.x, intersection.y);
			ctx.stroke();

			ray = intersection;
			let invDirectionVector = {x: -directionVector.x, y: -directionVector.y};
			let n = {x: intersection.x - reflectionObject.x, y: intersection.y - reflectionObject.y};
			let nLength = Math.hypot(n.x, n.y);
			n.x /= nLength;
			n.y /= nLength;
			let dot = invDirectionVector.x * n.x + invDirectionVector.y * n.y;
			let a = Math.sqrt(Math.hypot(directionVector.x, directionVector.y) ** 2 - Math.hypot(n.x, n.y) ** 2);
			directionVector = {x: 2 * n.x * dot - invDirectionVector.x, y: 2 * n.y * dot - invDirectionVector.y};
		}
		ctx.font = "15px Arial";
		if (clear) {
			ctx.fillText(rays + " rays", 5, 20);
		}
	}

	var frameAllDirections = () => {
		var startTime = Date.now();

		let directions = 100000;
		for (let i = 0; i < directions; i++) {
			frame({
				offsetX: origin.x + Math.sin(i / directions * Math.PI * 2) * 100,
				offsetY: origin.y + Math.cos(i / directions * Math.PI * 2) * 100,
			}, false);
		}

		let delta = Date.now() - startTime;
		//ctx.font = "15px Arial";
		ctx.fillText(delta + " milliseconds", 5, 20);
	}

	frame({offsetX: 21, offsetY: 300});
	canvas.mousemove(frame);
	canvas.click(e => {
		origin = {x: e.offsetX, y: e.offsetY};
		frame({offsetX: origin.x + 1, offsetY: origin.y});
	});
	$('html').keydown(e => {
		if (e.keyCode == 32) {
			frameAllDirections();
		}
		if (e.keyCode = 88) {
			showIntersections = !showIntersections;
			frame();
		}
		//console.log(e)
	});
})();