module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                src: ['ccs/src/ccs.js'],
                dest: 'ccs/build/<%= pkg.name %>.js',
                options: {
                    browserifyOptions: {
                    	//debug:true,
                        standalone: 'CCS'
                    }
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    'ccs/build/<%= pkg.name %>.min.js': ['ccs/build/<%= pkg.name %>.js']
                }
            }
        }
    })
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('bundle', ['browserify', 'uglify']);
}