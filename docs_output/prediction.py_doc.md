# Documentation for `prediction.py`

## Overview

Dream11 Team Predictor - Core Prediction Logic

This module contains the main prediction algorithm for Dream11 teams.
It can work in standalone mode or as part of the Django application.
## Dependencies

- `os`
- `logging`
- `pathlib.Path`

## Classes

### `Dream11TeamPredictor`

Class to predict the best Dream11 team for a given match

#### Methods

##### `__init__(self, data_folder_path)`

Initialize the predictor with the path to the data folder

Args:
    data_folder_path: Path to the folder containing IPL data files
                      If None, will look in default locations

Parameters:
- `self`
- `data_folder_path`

##### `_load_all_data(self)`

Load all available data from the data folder

Parameters:
- `self`

##### `_load_data_pandas(self)`

Load data using pandas

Parameters:
- `self`

##### `_load_data_csv(self)`

Load data using CSV reader (fallback if pandas is not available)

Parameters:
- `self`

##### `_load_team_data_csv(self)`

Load team data from the auction CSV file using standard csv module

Parameters:
- `self`

##### `_load_batting_stats_csv(self)`

Load batting stats from the most_runs CSV file using standard csv module

Parameters:
- `self`

##### `_load_bowling_stats_csv(self)`

Load bowling stats from the most_wickets CSV file using standard csv module

Parameters:
- `self`

##### `_process_auction_data(self)`

Process auction data to get team information when using pandas

Parameters:
- `self`

##### `get_all_teams(self)`

Get all teams in the dataset

Returns:
    list: Names of all teams

Parameters:
- `self`

##### `get_team_players(self, team_name)`

Get all players for a given team

Args:
    team_name: Name of the team
    
Returns:
    list: Players in the team

Parameters:
- `self`
- `team_name`

##### `calculate_player_scores(self, team1, team2)`

Calculate fantasy scores for all players in the two teams based on Dream11 scoring rules

Args:
    team1: First team name
    team2: Second team name
    
Returns:
    dict: Player fantasy scores

Parameters:
- `self`
- `team1`
- `team2`


## Functions

### `predict_team(self, team1, team2, budget, team_size)`

Predict the best Dream11 team for a match between team1 and team2

Args:
    team1: First team name
    team2: Second team name
    budget: Total budget for creating the team (in crores)
    team_size: Number of players in the team
    
Returns:
    dict: Selected team and metadata

Parameters:
- `self`
- `team1`
- `team2`
- `budget`
- `team_size`

