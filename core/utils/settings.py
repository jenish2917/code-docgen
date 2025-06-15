"""
CodeDocGen Settings and Configuration
Allows users to choose between speed and AI quality
"""

# Documentation generation modes
GENERATION_MODES = {
    'speed': 'Lightning Fast - Instant documentation (< 1 second)',
    'balanced': 'Smart & Fast - High-quality documentation (15 seconds)',
    'quality': 'Premium Quality - Comprehensive documentation (up to 1 minute)'
}

# Current mode (can be changed by user)
CURRENT_MODE = 'quality'  # Use highest quality AI generation with 60s timeout

# AI service settings
AI_TIMEOUT_SETTINGS = {
    'speed': 0,      # Skip AI entirely
    'balanced': 30,  # 30 second timeout for balanced quality
    'quality': 60    # 60 second maximum timeout for highest quality documentation
}

# Performance optimizations
ENABLE_INTEL_OPTIMIZATIONS = True
ENABLE_GPU_ACCELERATION = True
MAX_CPU_THREADS = None  # Auto-detect

# Documentation format settings
INCLUDE_DOCSTRINGS = True
INCLUDE_IMPORTS = True
INCLUDE_CLASSES = True
INCLUDE_FUNCTIONS = True
MAX_ITEMS_PER_SECTION = 10  # Limit to prevent huge docs

def get_current_mode():
    """Get the current generation mode"""
    return CURRENT_MODE

def set_generation_mode(mode):
    """Set the generation mode"""
    global CURRENT_MODE
    if mode in GENERATION_MODES:
        CURRENT_MODE = mode
        return True
    return False

def get_ai_timeout():
    """Get the AI timeout for current mode"""
    return AI_TIMEOUT_SETTINGS.get(CURRENT_MODE, 5)

def get_mode_description(mode=None):
    """Get description of a generation mode"""
    if mode is None:
        mode = CURRENT_MODE
    return GENERATION_MODES.get(mode, "Unknown mode")

def print_available_modes():
    """Print all available generation modes"""
    print("📋 Available Generation Modes:")
    for mode, description in GENERATION_MODES.items():
        marker = "🎯" if mode == CURRENT_MODE else "  "
        print(f"{marker} {mode}: {description}")
    print(f"\n✅ Current mode: {CURRENT_MODE}")
