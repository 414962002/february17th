# Contributing to february17th

Thank you for considering contributing to february17th! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Verify the issue is reproducible

When reporting bugs, include:
- Firefox version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

### Suggesting Features

Feature requests are welcome! Please:
- Check if the feature already exists or is planned
- Explain the use case clearly
- Consider security and privacy implications

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/february17th.git
   cd february17th
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Test your changes**
   - Load extension in Firefox (`about:debugging`)
   - Test all affected functionality
   - Check browser console for errors

5. **Commit your changes**
   ```bash
   git commit -m "Add feature: brief description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Describe what changes you made
   - Reference any related issues
   - Explain why the change is needed

## Development Guidelines

### Code Style

- Use clear, descriptive variable names
- Add comments for non-obvious logic
- Keep functions focused and small
- Use consistent indentation (2 spaces)

### Security

- Never add external dependencies without discussion
- Validate all user input
- No data collection or tracking
- Follow principle of least privilege

### Testing

Before submitting:
- [ ] Extension loads without errors
- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] Domain validation works correctly
- [ ] Export/import functionality tested

### Documentation

Update documentation when:
- Adding new features
- Changing existing behavior
- Modifying permissions
- Updating requirements

## Project Structure

```
february17th/
├── manifest.json          # Extension configuration
├── background.js          # Core proxy logic
├── popup.html/js/css      # Toolbar popup
├── options.html/js/css    # Settings page
├── ico/                   # Icons
└── docs/                  # Documentation
```

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion on GitHub Discussions
- Ask in your pull request

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
