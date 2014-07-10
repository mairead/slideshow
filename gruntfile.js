/* grunt boilerplate author: https://github.com/Integralist/Grunt-Boilerplate*/

module.exports = function (grunt) {

	// Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({
			
		// Used to connect to a locally running web server
		connect: {
			test: {
				port: 8000
			}
		},

		jshint: {
			files: ['Gruntfile.js', 'javascripts/**/*.js'],
			options: {
				curly:   true,
				eqeqeq:  true,
				immed:   true,
				latedef: true,
				newcap:  true,
				noarg:   true,
				sub:     true,
				undef:   true,
				boss:    true,
				eqnull:  true,
				browser: true,

				globals: {
					// AMD
          module:     true,
          require:    true,
          requirejs:  true,
          define:     true,

					// Environments
					console:    true,

					// General Purpose Libraries
					$:          true,
					jQuery:     true

				}
			}
		},

		uglify: {
			my_target: {
				files: {
					'public/javascripts/script.min.js': ['javascripts/script.js']
				}
			}
		},

		sass: {
			dist: {
				options: {
					style: 'compressed',
					require: ['./stylesheets/sass/helpers/url64.rb']
				},
				expand: true,
				cwd: './stylesheets/sass/',
				src: ['*.scss'],
				dest: './public/stylesheets/',
				ext: '.css'
			},
			dev: {
				options: {
					style: 'expanded',
					debugInfo: true,
					lineNumbers: true,
					require: ['./stylesheets/sass/helpers/url64.rb']
				},
				expand: true,
				cwd: './stylesheets/sass/',
				src: ['*.scss'],
				dest: './public/stylesheets/',
				ext: '.css'
			}
		},

		// `optimizationLevel` is only applied to PNG files (not JPG)
		imagemin: {
			png: {
				options: {
					optimizationLevel: 7
				},
				files: [
				{
					expand: true,
					cwd: './images/',
					src: ['**/*.png'],
					dest: './public/images/',
					ext: '.png'
				}
				]
			},
			jpg: {
				options: {
					progressive: true
				},
				files: [
				{
					expand: true,
					cwd: './images/',
					src: ['**/*.jpg'],
					dest: './public/images/',
					ext: '.jpg'
				}
				]
			}
		},

		// Run: `grunt watch` from command line for this section to take effect
		watch: {
			files: ['<%= jshint.files %>', '<%= sass.dev.src %>'],
			tasks: 'default'
		}

	});

	// Default Task
	grunt.registerTask('default', ['jshint', 'connect', 'sass:dev', 'uglify']);

	// Release Task
	grunt.registerTask('release', ['jshint', 'sass:dist', 'imagemin', 'uglify']);


};