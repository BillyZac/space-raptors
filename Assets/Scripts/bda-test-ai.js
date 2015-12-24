﻿#pragma strict
// Constants
static var ACTIONS :int = 3;


// Inspector Variables
public class Capabilities {
	var speed :float;
	var jumpForce :float;
	var attackPower :float;
	var maxVelocity :float;
	var meleeRange :float;
}
public class Reactions {
	var reactionTime :float;
	var distThreshold :float;
	var meleeFreq :float;
}
public class Pointers {
	var rigidBody :Rigidbody2D;
	var animator :Animator;
	var player :GameObject;
}
var capabilities :Capabilities;
var reactions :Reactions;
var pointers :Pointers;


// Script Variables
private var randomActions :Function[];
private var meleeCoolDown :float = 1f;
private var reactionCoolDown :float = 1f;
private var ready :boolean = true;



function Start () {
	randomActions = new Function[ACTIONS];
	randomActions[0] = Growl;
	randomActions[1] = Stomp;
	randomActions[2] = Hiss;
}

function FixedUpdate () {
	if (meleeCoolDown > 0f) meleeCoolDown -= Time.deltaTime;
	if (reactionCoolDown > 0f) reactionCoolDown -= Time.deltaTime;
	
	if (ready && (meleeCoolDown <= 0f || reactionCoolDown <= 0f)) {
		var dist :float = distanceCalc(transform.position, pointers.player.transform.position);
		FacePlayer();
		DoSomethingRandom();
		// if distance && meleecooldown attack
		
		// if player.platform = self.platform - move to player
		// recursive calculate platform path to player to build move instructions
		// follow instructions while player is on same platform or in the air
	}
	
}

function distanceCalc(point1 :Vector2, point2 :Vector2): float {
	return Mathf.Sqrt(Mathf.Pow(point1.x - point2.x, 2.0) + Mathf.Pow(point1.y - point2.y, 2.0));
}

function FacePlayer() {
	if (pointers.player.transform.position.x > transform.position.x) transform.localScale = new Vector3(-1f, 1f, 1f);
	else transform.localScale = new Vector3(1f, 1f, 1f);
}

function DoSomethingRandom() {
	ready = false;
	var action :int = Random.Range(0, ACTIONS);
	randomActions[action]();
	yield;
}

function Growl() {
	var renderer :SpriteRenderer = GetComponent(SpriteRenderer);
	renderer.color = Color.green;
	Debug.Log('before');
	yield WaitForSeconds(5);
	Debug.Log('after');
	renderer.color = Color.white;
	ready = true;
}

function Stomp() {
	var renderer :SpriteRenderer = GetComponent(SpriteRenderer);
	renderer.color = Color.yellow;
	Debug.Log('before');
	yield WaitForSeconds(5);
	Debug.Log('after');
	renderer.color = Color.white;
	ready = true;
}

function Hiss() {
	var renderer :SpriteRenderer = GetComponent(SpriteRenderer);
	renderer.color = Color.blue;
	Debug.Log('before');
	yield WaitForSeconds(5);
	Debug.Log('after');
	renderer.color = Color.white;
	ready = true;
}
