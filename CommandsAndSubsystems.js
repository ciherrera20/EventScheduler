// Requires is a list of subsystems, and code is an object whose keys are functions
var CommandFactory = (function() {
	// An array of Commands in order from first added to last added
	var rawCommandQueue = new Array();
	
	// Instances of CommandFactories created
	var instances = 0;
	
	// A CommandFactory to create commands
	var CommandFactory = function(requires, code, priority) {
		// Get a list of subsystemIDs from a list of subsystems
		function getRequirementIDs(requires) {
			var temp = new Array();
			for (var i = 0; i < requires.length; i++) {
				temp.push(requires[i].getSubsystemID());
			}
			return temp;
		}
		
		// Get the requirements for the command
		var requires = getRequirementIDs(requires);
		
		// An object containing functions that the Commands created with this CommandFactory will run and variables to be used in those functions
		var code = code;
		
		// The priority of Commands created with this CommandFactory
		var priority = priority;
		if (!priority) // Default to 0 if the priority is undefined or null
			priority = 0;
		
		// Flag to check if Commands created with this CommandFactory are default Commands
		var defaultCommand = false;
		
		// An ID assigned to the CommandFactory
		var commandConstructorID = instances++;
		
		// Command constructor
		var Command = function() {
			// For use in private functions
			var that = this;
			
			// A string describing the Command's status. Defaults to idle
			var status = "idle";
			
			// Gets the current status of the Command
			this.getStatus = function() {
				return status;
			}
			
			// Gets the priority of the Command
			this.getPriority = function() {
				return priority;
			}
			
			// Gets a list of subsystems that the Command requires
			this.getRequirements = function() {
				return requires;
			}
			
			// Checks if the Command is a default Command
			this.isDefault = function() {
				return defaultCommand;
			}
			
			// Gets the commandConstructorID of the CommandFactory that created this Command
			this.getCommandConstructorID = function() {
				return commandConstructorID;
			}
			
			// Adds the keys from the code object to the Command instance
			var keyList = Object.keys(code);
			for (var i = 0; i < keyList.length; i++) {
				// Switch case for the canRun, intialize, execute, isFinished, end, and interrupted keys in order to modify the functions associated with them
				switch (keyList[i]) {
					case "canRun":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								// Add code here
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "initialize":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								status = "running"; // Updates the Command's status to running
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "execute":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								// Add code here
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "isFinished":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								// Add code here
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "end":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								status = "idle"; // Updates the Command's status to idle
								return temp(that);
							}
							
							return func;
						})();
						break;
					case "interrupted":
						this[keyList[i]] = (function() {
							var temp = code[keyList[i]];
							
							var func = function() {
								status = "idle"; // Updates the Command's status to idle
								return temp(that);
							}
							
							return func;
						})();
						break;
					default:
						this[keyList[i]] = code[keyList[i]];
				}
			}
			
			// Adds the command to the rawCommandQueue if it has not been added yet;
			var add = true;
			for (var i = 0; i < rawCommandQueue.length; i++) {
				if (rawCommandQueue[i].getCommandConstructorID() === this.getCommandConstructorID()) {
					add = false;
					break;
				}
			}
			if (add)
				rawCommandQueue.push(this);
		}
		
		// Adds the setDefault function to the CommandFactory constructor's prototype
		Command.setDefault = function() {
			if (priority === 0 && requires.length === 1)
				defaultCommand = true;
		}
		
		// Returns the Command constructor
		return Command;
	}
	
	// Gets the rawCommandQueue
	CommandFactory.getRawCommandQueue = function() {
		return rawCommandQueue;
	}
	
	// Returns the CommandFactory constructor
	return CommandFactory;
})();

// Name is the name of the subsystem
var Subsystem = (function() {
	// The number of Subsystem instances that have been created
	var instances = 0;
	
	// The Subsystem constructor function
	var Subsystem = function(name) {
		// The subsystemID of this Subsystem
		var subsystemID = instances++;
		
		// A variable to hold the default Command if one is added
		var defaultCommand;
	
		// Sets the specified Command to a default Command and creates an instance of it
		function initDefault(CommandFactory) {
			CommandFactory.setDefault();
			defaultCommand = new CommandFactory();
		}
		
		// Gets the Subsystem ID of this Subsystem
		this.getSubsystemID = function() {
			return subsystemID;
		}
		
		// The name of the Subsystem
		this.name = name;
		
		// Sets a CommandFactory to create default Commands, if one has not been set yet
		this.setDefaultCommand = function(CommandFactory) {
			if (!defaultCommand) {
				initDefault(CommandFactory);
			}
		}
	}
	
	// Adds the function getNumSubsystems to the constructor
	Subsystem.getNumSubsystems = function() {
		return instances;
	}
	
	// Returns the Subsystem constructor
	return Subsystem;
})();

if (!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	}
}