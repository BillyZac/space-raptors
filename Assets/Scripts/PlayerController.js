﻿#pragma strict

var speed :float;
var jumpForce :float;
var rigidBody :Rigidbody2D;
var maxVelocity : float;

function Start () {

}

function FixedUpdate () {
	var direction = Input.GetAxisRaw("Horizontal") * speed * Time.deltaTime;
	rigidBody.AddForce(Vector2(direction, 0));
	Mathf.Clamp(rigidBody.velocity.x, -maxVelocity, maxVelocity);
	
	if (Input.GetAxis("Vertical") > 0 && rigidBody.velocity.y == 0) {
		rigidBody.AddForce(Vector2(0, jumpForce));
	}
}