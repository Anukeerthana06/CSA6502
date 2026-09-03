"""
authentication.py
------------------
Simple demonstration authentication for IndustroSense AI.

This is NOT production-grade authentication. It exists to demonstrate
the concept of gating access to the application for a college prototype.
Credentials are read from environment variables (see .env.example) and
compared using a constant-time comparison to avoid trivial timing leaks.

Production deployments should replace this with a real identity
provider (OAuth2/OIDC, SSO, etc.) and never manage passwords directly.
"""

import hmac

import config


def check_credentials(username: str, password: str) -> bool:
    """
    Returns True if the supplied username/password match the configured
    demonstration credentials. Uses hmac.compare_digest to reduce timing
    side-channel risk.
    """
    if username is None or password is None:
        return False

    username_ok = hmac.compare_digest(username.strip(), config.APP_USERNAME)
    password_ok = hmac.compare_digest(password, config.APP_PASSWORD)
    return username_ok and password_ok


def is_using_default_password() -> bool:
    """Warns the operator if they never changed the sample password."""
    return config.APP_PASSWORD == "change_me"
