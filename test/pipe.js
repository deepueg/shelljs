var shell = require('..');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

// commands like `rm` can't be on the right side of pipes
assert.equal(typeof shell.ls('.').rm, 'undefined');
assert.equal(typeof shell.cat('resources/file1.txt').rm, 'undefined');

//
// Valids
//

// piping to cat() should return roughly the same thing
assert.strictEqual(shell.cat('resources/file1.txt').cat().toString(),
    shell.cat('resources/file1.txt').toString());

// piping ls() into cat() converts to a string
assert.strictEqual(shell.ls('resources/').cat().toString(),
    shell.ls('resources/').stdout);

var result;
result = shell.ls('resources/').grep('file1');
assert.equal(result + '', 'file1\nfile1.js\nfile1.txt\n');

result = shell.ls('resources/').cat().grep('file1');
assert.equal(result + '', 'file1\nfile1.js\nfile1.txt\n');

// Equivalent to a simple grep() test case
result = shell.cat('resources/grep/file').grep(/alpha*beta/);
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');

// Equivalent to a simple sed() test case
result = shell.cat('resources/grep/file').sed(/l*\.js/, '');
assert.ok(!shell.error());
assert.equal(result.toString(), 'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n');

// Sort a file by frequency of each line
result = shell.sort('resources/uniq/pipe').uniq('-c').sort('-n');
assert.equal(shell.error(), null);
assert.equal(result.toString(), shell.cat('resources/uniq/pipeSorted').toString());

// Synchronous exec. To support Windows, the arguments must be passed
// using double quotes because node, following win32 convention,
// passes single quotes through to process.argv verbatim.
result = shell.cat('resources/grep/file').exec('shx grep "alpha*beta"');
assert.ok(!shell.error());
assert.equal(result, 'alphaaaaaaabeta\nalphbeta\n');

// Async exec
shell.cat('resources/grep/file').exec('shx grep "alpha*beta"', function (code, stdout) {
  assert.equal(code, 0);
  assert.equal(stdout, 'alphaaaaaaabeta\nalphbeta\n');
  shell.exit(123);
});