﻿#pragma strict

public class PathFinding extends MonoBehaviour {
	private class BuildCollection {
		private var Methods :Methods;
		public var start :Methods.ObjectWithCorners;
		public var target :Methods.ObjectWithCorners;
		public var platforms :Methods.ObjectWithCorners[];
		public var steps :Array;
		public var possibilities :Array;
		public var position :Vector2;
		public function BuildCollection(startP :GameObject, targetP :GameObject, tag :String) {
			var plats = GameObject.FindGameObjectsWithTag(tag);
			platforms = new Methods.ObjectWithCorners[plats.Length];
			for (var i :int = 0; i < plats.Length; i++) {
				platforms[i] = new Methods.ObjectWithCorners(plats[i]);
			}
			start = new Methods.ObjectWithCorners(startP);
			target = new Methods.ObjectWithCorners(targetP);
			steps = new Array(start);
			possibilities = new Array();
		}
		public function stepThrough(current :Methods.ObjectWithCorners, tolerance :float, stats :Capabilities) {
			var position :int = 0;
			// Build a viable path to target from start
			while (position >= 0 && current.gameObject != target.gameObject)
			{
				if (possibilities.length <= position) {
					// a list of every platform that can be reached from current platfrom that is not already in the path
					var options :Array = Methods.filter(platforms, function(object :Methods.ObjectWithCorners) :boolean {
						return object.gameObject != current.gameObject && reachable(current, object, stats) &&
						PathFinding.notIn(steps, object);
					});
					// sort by distance to target platform with preference to higher platforms
					Methods.sort(options, function(obj1 :Methods.ObjectWithCorners, obj2 :Methods.ObjectWithCorners) :float {
						return (Methods.distance(target.corners.landCenter, obj1.corners.landCenter) - obj1.corners.landCenter.y) -
							(Methods.distance(target.corners.landCenter, obj2.corners.landCenter) - obj2.corners.landCenter.y);
					});
					possibilities.Push(options);
				}
				if ((possibilities[position] as Array).length == 0) {
					possibilities.Pop();
					steps.Pop();
					position--;
				} else {
					if (Methods.indexOf(possibilities[position] as Array, target) >= 0) {
						current = target;
					} else {
						current = (possibilities[position] as Array).Pop() as Methods.ObjectWithCorners;
					}
					steps.Push(current);
					position++;
				}
			}
		}
	}
	public static function buildSteps(target :GameObject, mover :GameObject, tag :String, tolerance :float, stats :Capabilities) :Array {
		var Methods :Methods;
		var startPlatform :GameObject = Methods.onTaggedObject(mover, 0.1, tag);
		var targetPlatform :GameObject = Methods.onTaggedObject(target, 0.1, tag);
		if (!startPlatform || !targetPlatform || startPlatform == targetPlatform) return new Array();
		var collection :BuildCollection = new BuildCollection(startPlatform, targetPlatform, tag);
		collection.stepThrough(collection.start, tolerance, stats);
		return Methods.map(collection.steps, function(element :Methods.ObjectWithCorners) :GameObject {
			return element.gameObject;
		});
	}
	private static function reachable(start :Methods.ObjectWithCorners, end :Methods.ObjectWithCorners, stats :Capabilities) :boolean {
		return end.corners.topLeft.y <= start.corners.topLeft.y + stats.jumpHeight &&
			end.corners.topLeft.x <= start.corners.topRight.x + stats.jumpWidth &&
			end.corners.topRight.x >= start.corners.topLeft.x - stats.jumpWidth;
	}
	private static function notIn(array :Array, object :Methods.ObjectWithCorners) :boolean {
		for (var i :int = 0; i < array.length; i++) {
			if ((array[i] as Methods.ObjectWithCorners).gameObject == object.gameObject) return false;
		}
		return true;
	}
	public static function howToGetThere(object :GameObject, start :GameObject, target :GameObject, tolerance :float, stats :Capabilities) :Array {
		var objectExtend :Methods.ObjectWithCorners = new Methods.ObjectWithCorners(object);
		var startExtend :Methods.ObjectWithCorners = new Methods.ObjectWithCorners(start);
		var targetExtend :Methods.ObjectWithCorners = new Methods.ObjectWithCorners(target);
		if (!PathFinding.reachable(startExtend, targetExtend, stats)) return new Array();
		
		if (startExtend.corners.landCenter.y > targetExtend.corners.landCenter.y && targetExtend.corners.topLeft.x <= startExtend.corners.topLeft.x -
			Methods.distance(objectExtend.corners.bottomLeft, objectExtend.corners.bottomRight) / 2f && targetExtend.corners.topRight.x >= startExtend.corners.topLeft.x
		) {
			return new Array('FallLeft');
		} else if (startExtend.corners.landCenter.y > targetExtend.corners.landCenter.y && targetExtend.corners.topRight.x >= startExtend.corners.topRight.x +
			Methods.distance(objectExtend.corners.bottomLeft, objectExtend.corners.bottomRight) / 2f && targetExtend.corners.topLeft.x <= startExtend.corners.topRight.x
		) {
			return new Array('FallRight');
		} else if (startExtend.corners.landCenter.y > targetExtend.corners.landCenter.y && targetExtend.corners.landCenter.x >= startExtend.corners.topLeft.x &&
			targetExtend.corners.landCenter.x <= startExtend.corners.topRight.x
		) {
			if (startExtend.corners.topLeft.x - targetExtend.corners.topLeft.x >= targetExtend.corners.topRight.x - startExtend.corners.topRight.x) {
				return new Array('FallAroundLeft', targetExtend.corners.topLeft);
			}
			else return new Array('FallAroundRight', targetExtend.corners.topRight);
		} else if (Methods.distance(startExtend.corners.topLeft, targetExtend.corners.topRight) <= tolerance) {
			return new Array('MoveLeft', targetExtend.corners.topRight);
		} else if (Methods.distance(startExtend.corners.topRight, targetExtend.corners.topLeft) <= tolerance) {
			return new Array('MoveRight', targetExtend.corners.topLeft);
		} else if (startExtend.corners.topLeft.x > targetExtend.corners.topRight.x) {
			return new Array('JumpLeft', startExtend.corners.topLeft, targetExtend.corners.topRight);
		} else if (startExtend.corners.topRight.x < targetExtend.corners.topLeft.x) {
			return new Array('JumpRight', startExtend.corners.topRight, targetExtend.corners.topLeft);
		} else if (startExtend.corners.landCenter.y < targetExtend.corners.landCenter.y && targetExtend.corners.landCenter.x >= startExtend.corners.topLeft.x &&
			targetExtend.corners.landCenter.x <= startExtend.corners.topRight.x
		) {
			if (targetExtend.corners.topLeft.x - startExtend.corners.topLeft.x >= startExtend.corners.topRight.x - targetExtend.corners.topRight.x) {
				return new Array('JumpAroundLeft', startExtend.corners.topLeft, targetExtend.corners.topLeft);
			}
			else return new Array('JumpAroundRight', startExtend.corners.topRight, targetExtend.corners.topRight);
		}
		else return new Array();
	}
}
