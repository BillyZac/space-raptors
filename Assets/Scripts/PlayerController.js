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
var defaultCooldown :float;
var weapons : GameObject[];
var switchCooldown :float;
var armor :int;
var collisionDamage :int;
var stealthTime :float;
var stealth :boolean;
var stealthCooldown :float;

private var weaponAnimator :Animator;
private var weaponProjectile :GameObject;
private var shotCooldown :float;

function Start () {
	shotCooldown = 0;
	weaponAnimator = currentWeapon.GetComponent(Animator);
	weaponProjectile = currentWeapon.GetComponent(ShootWeapon).projectile;
}

function FixedUpdate () {
	if (stealthTime && stealth) {
		stealthTime -= Time.deltaTime;
		if (stealthTime <= 0) {
			stealth = false;
			GetComponent(SpriteRenderer).color.a = 1;
		}
	}

	if (shotCooldown) {
		shotCooldown -= Time.deltaTime;
	}
	if (stealthCooldown) {
		stealthCooldown -= Time.deltaTime;
	}
	if (switchCooldown) {
		switchCooldown -= Time.deltaTime;
	}
	var direction = Input.GetAxisRaw("Horizontal") * speed * Time.deltaTime;
	if (animator.GetBool("dead") == false) {
		transform.Translate(new Vector2(direction, 0));
	}
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


	if (Input.GetAxis("Jump") > 0 && rigidBody.velocity.y == 0 && animator.GetBool("dead") == false) {
		animator.SetBool("walking", false);
		weaponAnimator.SetBool("walking", false);
		rigidBody.AddForce(Vector2(0, jumpForce));
	}

	if (rigidBody.velocity.y > 0) {
		animator.SetBool("jumping", true);
		animator.SetBool("falling", false);
		weaponAnimator.SetBool("jumping", true);
		weaponAnimator.SetBool("falling", false);
	} else if (rigidBody.velocity.y < 0) {
		animator.SetBool("jumping", false);
		animator.SetBool("falling", true);
		weaponAnimator.SetBool("jumping", false);
		weaponAnimator.SetBool("falling", true);
	} else if (rigidBody.velocity.y == 0) {
		//TODO: This also gets set to 0 at the apex of a jump
		animator.SetBool("jumping", false);
		animator.SetBool("falling", false);
		weaponAnimator.SetBool("jumping", false);
		weaponAnimator.SetBool("falling", false);
	}

	var shoot = Input.GetAxis("Fire1");
	if (shotCooldown <= 0 && shoot && animator.GetBool("dead") == false) {
		animator.SetTrigger("shoot");
		weaponAnimator.SetTrigger("shoot");
		var newShot = Instantiate(weaponProjectile, Vector2(gameObject.transform.position.x + shotOffset.x, gameObject.transform.position.y + shotOffset.y), Quaternion.identity);
		newShot.GetComponent(ProjectileController).direction = transform.localScale.x;
		shotCooldown = defaultCooldown;
	}

	var weaponSwitch = 0;

	if (Input.GetAxis("Stealth") && stealthCooldown <= 0) {
		stealthCooldown = defaultCooldown;
		if (stealth) {
			stealth = false;
			GetComponent(SpriteRenderer).color.a = 1;
		} else if (!stealth && stealthTime) {
			stealth = true;
			GetComponent(SpriteRenderer).color.a = 0.2;
		}
	}

	if (Input.GetAxis("Fire2")) {
		weaponSwitch = -1;
	} else if (Input.GetAxis("Fire3")) {
		weaponSwitch = 1;
	}
	if (switchCooldown <= 0 && weaponSwitch && animator.GetBool("dead") == false) {
		switchCooldown = defaultCooldown;
		var current :int;
		for (var i=0;i<weapons.length;i++) {
			if (weapons[i].name == currentWeapon.name.Replace("(Clone)", "")) {
				current = i;
				break;
			}
		}
		if(current + weaponSwitch >= 0 && current + weaponSwitch < weapons.length && animator.GetBool("dead") == false) {
			SwitchWeapon(weapons[current + weaponSwitch]);
		}
	}
}

function ItemPickup (newItem :GameObject) {
	if (newItem.tag == "Weapon") {
		ArrayUtility.Add(weapons, newItem);
		SwitchWeapon(newItem);
	} else if (newItem.tag == "Powerup") {
		if (newItem.name.Contains("Health" && "25")) {
			HealDamage(25);
		} else if (newItem.name.Contains("Health" && "50")) {
			HealDamage(50);
		} else if (newItem.name.Contains("Health" && "Max")) {
			HealDamage(100);
		} else if (newItem.name.Contains("Armor" && "50")) {
			armor += 50;
		} else if (newItem.name.Contains("Armor" && "100")) {
			armor += 100;
		}

		if (armor > 100) {
			armor = 100;
		}
	}
}

function OnCollisionEnter2D (collision :Collision2D) {
	if (collision.gameObject.tag == "Enemy") {
		TakeDamage(collisionDamage);
	}
}

function HealDamage (heal :int) {
	health += heal;
	if (health > 100) {
		health = 100;
	}
	Debug.Log(health);
}

function TakeDamage (damage :int) {
	animator.SetTrigger("hit");
	weaponAnimator.SetTrigger("hit");
	if (armor) {
		armor -= damage;
		if (armor < 0) {
			armor = 0;
		}
		Debug.Log(armor);
	} else {
		health -= damage;
		Debug.Log(health);
		if (health <= 0) {
			animator.SetBool("dead", true);
			weaponAnimator.SetBool("dead", true);
		}
	}
	if (health > 0) {
		this.gameObject.SendMessage('DisplayDamage');
	}
}

function SwitchWeapon (weapon :GameObject) {
	Destroy(currentWeapon);
	var newWeapon = Instantiate(weapon, gameObject.transform.position, Quaternion.identity);
	newWeapon.transform.parent = gameObject.transform;
	newWeapon.transform.localScale.x *= transform.localScale.x;
	currentWeapon = newWeapon;
	weaponAnimator = currentWeapon.GetComponent(Animator);
	weaponProjectile = currentWeapon.GetComponent(ShootWeapon).projectile;
}

function Die () {
	Application.LoadLevel (Application.loadedLevel);
}
