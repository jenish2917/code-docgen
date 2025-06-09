# Documentation for `models.py`

## Overview

This file `models.py` contains Python code. No module-level docstring was found.
## Dependencies

- `django.db.models`
- `django.contrib.auth.models.User`
- `django.utils.timezone`

## Classes

### `UserProfile`

No documentation available

#### Attributes

- `user`: models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
- `bio`: models.TextField(max_length=500, blank=True)
- `preferred_team`: models.CharField(max_length=100, blank=True)
- `created_at`: models.DateTimeField(auto_now_add=True)
- `updated_at`: models.DateTimeField(auto_now=True)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `Team`

No documentation available

#### Attributes

- `name`: models.CharField(max_length=100)
- `short_name`: models.CharField(max_length=10)
- `logo`: models.URLField(blank=True, null=True)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `Venue`

No documentation available

#### Attributes

- `name`: models.CharField(max_length=100)
- `city`: models.CharField(max_length=100)
- `country`: models.CharField(max_length=100)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `Player`

No documentation available

#### Attributes

- `ROLE_CHOICES`: (('BAT', 'Batsman'), ('BWL', 'Bowler'), ('AR', 'All-Rounder'), ('WK', 'Wicket-Keeper'))
- `name`: models.CharField(max_length=100)
- `team`: models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
- `role`: models.CharField(max_length=3, choices=ROLE_CHOICES)
- `batting_average`: models.FloatField(default=0.0)
- `bowling_average`: models.FloatField(default=0.0)
- `recent_form`: models.FloatField(default=0.0)
- `consistency_index`: models.FloatField(default=0.0)
- `last_5_matches_form`: models.FloatField(default=0.0)
- `venue_performance`: models.JSONField(null=True, blank=True)
- `opposition_performance`: models.JSONField(null=True, blank=True)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `PredictionHistory`

No documentation available

#### Attributes

- `user`: models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
- `team1`: models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team1_predictions')
- `team2`: models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team2_predictions')
- `result`: models.JSONField()
- `created_at`: models.DateTimeField(auto_now_add=True)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `Prediction`

No documentation available

#### Attributes

- `PREDICTION_TYPE_CHOICES`: (('BAT', 'Batting Friendly'), ('BWL', 'Bowling Friendly'), ('BAL', 'Balanced'), ('SPIN', 'Spin Friendly'))
- `user`: models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_predictions', null=True, blank=True)
- `title`: models.CharField(max_length=255, blank=True)
- `description`: models.TextField(blank=True)
- `team1`: models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team1_user_predictions', null=True, blank=True)
- `team2`: models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team2_user_predictions', null=True, blank=True)
- `team1_name`: models.CharField(max_length=100, blank=True)
- `team2_name`: models.CharField(max_length=100, blank=True)
- `venue`: models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name='predictions')
- `venue_name`: models.CharField(max_length=200, blank=True)
- `match_date`: models.DateTimeField(null=True, blank=True)
- `prediction_type`: models.CharField(max_length=4, choices=PREDICTION_TYPE_CHOICES, default='BAL')
- `is_public`: models.BooleanField(default=True)
- `created_at`: models.DateTimeField(auto_now_add=True)
- `updated_at`: models.DateTimeField(auto_now=True)

#### Methods

##### `get_team1_name(self)`

No documentation available

Parameters:
- `self`

##### `get_team2_name(self)`

No documentation available

Parameters:
- `self`

##### `get_venue_name(self)`

No documentation available

Parameters:
- `self`

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `PredictionPlayer`

No documentation available

#### Attributes

- `prediction`: models.ForeignKey(Prediction, on_delete=models.CASCADE, related_name='players')
- `player`: models.ForeignKey(Player, on_delete=models.CASCADE, related_name='prediction_selections')
- `captain`: models.BooleanField(default=False)
- `vice_captain`: models.BooleanField(default=False)
- `expected_points`: models.FloatField(default=0.0)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `PlayerComment`

No documentation available

#### Attributes

- `user`: models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_comments')
- `player`: models.ForeignKey(Player, on_delete=models.CASCADE, related_name='comments')
- `comment`: models.TextField()
- `created_at`: models.DateTimeField(auto_now_add=True)
- `updated_at`: models.DateTimeField(auto_now=True)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

### `PredictionLike`

No documentation available

#### Attributes

- `user`: models.ForeignKey(User, on_delete=models.CASCADE, related_name='prediction_likes')
- `prediction`: models.ForeignKey(Prediction, on_delete=models.CASCADE, related_name='likes')
- `created_at`: models.DateTimeField(auto_now_add=True)

#### Methods

##### `__str__(self)`

No documentation available

Parameters:
- `self`

