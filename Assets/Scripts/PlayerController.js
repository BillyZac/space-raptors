﻿#pragma strict

var health :int;
var speed :float;
var jumpForce :float;
var rigidBody :Rigidbody2D;
var maxVelocity :float;
var turnDeadZone :float;
var animator :Animator;
var shotOffset :Vector2;
var currentWeapon :GameObject;
var defaultCooldown : int;
var weapons : Array;

private var weaponAnimator :Animator;
private var weaponProjectile :GameObject;
private var shotCooldown :int;

function Start () {
	shotCooldown = 0;
	weaponAnimator = currentWeapon.GetComponent(Animator);
	weaponProjectile = currentWeapon.GetComponent(ShootWeapon).projectile;
}

function FixedUpdate () {
	if (shotCooldown) {
		shotCooldown--;
	}
	var direction = Input.GetAxisRaw("Horizontal") * speed * Time.deltaTime;
	transform.Translate(new Vector2(direction, 0));
	
	if (direction > turnDeadZone) {
		transform.localScale = new Vector3(1, 1, 1);
		animator.SetBool("walking", true);
		weaponAnimator.SetBool("walking", true);
		shotOffset.x = 2;
	} else if (direction < -turnDeadZone) {
		transform.localScale = new Vector3(-1, 1, 1);
		animator.SetBool("walking", true);
		weaponAnimator.SetBool("walking", true);
		shotOffset.x = -2;
	} else {
		animator.SetBool("walking", false);
		weaponAnimator.SetBool("walking", false);
	}
	
	if (Input.GetAxis("Vertical") > 0 && rigidBody.velocity.y == 0) {
		animator.SetBool("jumping", true);
		animator.SetBool("walking", false);
		weaponAnimator.SetBool("jumping", true);
		weaponAnimator.SetBool("walking", false);
		rigidBody.AddForce(Vector2(0, jumpForce));
	} else if (rigidBody.velocity.y == 0) {
	//TODO: This also gets set to 0 at the apex of a jump
		animator.SetBool("jumping", false);
		weaponAnimator.SetBool("jumping", false);
	}
	
	var shoot = Input.GetAxis("Fire1");
	if (!shotCooldown && shoot) {
	animator.SetTrigger("shoot");
	weaponAnimator.SetTrigger("shoot");
		var newShot = Instantiate(weaponProjectile, Vector2(gameObject.transform.position.x + shotOffset.x, gameObject.transform.position.y + shotOffset.y), Quaternion.identity);
		newShot.GetComponent(ProjectileController).direction = transform.localScale.x;
		shotCooldown = defaultCooldown;
	}
}

function ItemPickup (newItem :GameObject) {
	if (newItem.tag == "Weapon") {
		SwitchWeapon(newItem);
	}
}

function TakeDamage (damage :int) {
	health -= damage;
	if (health <= 0) {
		Application.LoadLevel (Application.loadedLevel);
	}
}

function SwitchWeapon (weapon :GameObject) {
	Destroy(transform.GetChild(0).gameObject);
	var newWeapon = Instantiate(weapon, gameObject.transform.position, Quaternion.identity);

	newWeapon.transform.parent = gameObject.transform;
	currentWeapon = newWeapon;
	weaponAnimator = currentWeapon.GetComponent(Animator);
	weaponProjectile = currentWeapon.GetComponent(ShootWeapon).projectile;

}