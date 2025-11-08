# Gumroad Local Setup Guide for macOS (M3 Apple Silicon)

> **Complete step-by-step guide to set up Gumroad development environment on macOS with M3 (Apple Silicon)**
>
> Last Updated: November 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [System Requirements](#system-requirements)
4. [Installation Steps](#installation-steps)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Verification & Testing](#verification--testing)
8. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
9. [Development Workflow](#development-workflow)
10. [Useful Commands](#useful-commands)
11. [Next Steps](#next-steps)

---

## Overview

This guide walks you through setting up the complete Gumroad development environment on a Mac with M3 (Apple Silicon) chip. The setup includes:

- Ruby 3.4.3 with Rails 7.1
- Node.js 20.17.0 with npm
- Docker for running services (MySQL, Redis, Elasticsearch, MongoDB)
- All required dependencies and tools

**Estimated Setup Time:** 45-60 minutes

---

## Prerequisites

Before starting, ensure you have:

1. **macOS** (Sonoma 14.0 or later recommended)
2. **M3 MacBook** (Apple Silicon)
3. **Administrator access** on your machine
4. **Stable internet connection** (for downloading dependencies)
5. **At least 20GB free disk space**

---

## System Requirements

### Hardware
- **Processor:** Apple M3 chip
- **RAM:** 16GB minimum (32GB recommended)
- **Storage:** 20GB free space minimum

### Software
- **macOS:** 14.0 (Sonoma) or later
- **Xcode Command Line Tools**
- **Homebrew** (package manager)

---

## Installation Steps

### Step 1: Install Xcode Command Line Tools

The Xcode Command Line Tools are required for compiling native extensions.

```bash
xcode-select --install
```

Click "Install" when prompted. This may take 10-15 minutes.

**Verify Installation:**
```bash
xcode-select -p
# Should output: /Library/Developer/CommandLineTools
```

---

### Step 2: Install Homebrew

Homebrew is macOS's package manager. We'll use it to install most dependencies.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Add Homebrew to your PATH** (for Apple Silicon):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Verify Installation:**
```bash
brew --version
# Should output: Homebrew 4.x.x or later
```

---

### Step 3: Install Ruby 3.4.3

We'll use `rbenv` to manage Ruby versions.

**Install rbenv and ruby-build:**
```bash
brew install rbenv ruby-build
```

**Add rbenv to your shell:**
```bash
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc
```

**Install Ruby 3.4.3:**
```bash
rbenv install 3.4.3
rbenv global 3.4.3
```

This will take 5-10 minutes to compile Ruby.

**Verify Installation:**
```bash
ruby -v
# Should output: ruby 3.4.3
```

**Install Bundler:**
```bash
gem install bundler
```

**Install dotenv gem** (required for some commands):
```bash
gem install dotenv
```

---

### Step 4: Install Node.js 20.17.0

We'll use `nvm` (Node Version Manager) for managing Node.js versions.

**Install nvm:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Add nvm to your shell:**
```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
```

**Install Node.js 20.17.0:**
```bash
nvm install 20.17.0
nvm use 20.17.0
nvm alias default 20.17.0
```

**Verify Installation:**
```bash
node -v
# Should output: v20.17.0

npm -v
# Should output: 10.x.x or later
```

**Enable Corepack** (for managing package managers):
```bash
corepack enable
```

---

### Step 5: Install Docker Desktop

Docker will run our development services (MySQL, Redis, Elasticsearch, MongoDB).

**Download Docker Desktop for Apple Silicon:**
1. Visit [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Click "Download for Mac - Apple Chip"
3. Open the downloaded `.dmg` file
4. Drag Docker to Applications folder
5. Launch Docker Desktop from Applications
6. Follow the setup wizard

**Verify Installation:**
```bash
docker --version
# Should output: Docker version 24.x.x or later

docker-compose --version
# Should output: Docker Compose version 2.x.x or later
```

**Configure Docker Resources:**
1. Open Docker Desktop
2. Go to Settings → Resources
3. Set:
   - **CPUs:** 4 or more
   - **Memory:** 8GB or more
   - **Disk:** 40GB or more
4. Click "Apply & Restart"

---

### Step 6: Install MySQL 8.0 (Client Only)

We need MySQL client libraries for the `mysql2` gem. The actual MySQL server will run in Docker.

**Install MySQL 8.0:**
```bash
brew install mysql@8.0 percona-toolkit
```

**Link MySQL:**
```bash
brew link --force mysql@8.0
```

**Install OpenSSL** (required by mysql2 gem):
```bash
brew install openssl
```

**Configure Bundler to use OpenSSL:**
```bash
bundle config --global build.mysql2 --with-opt-dir="$(brew --prefix openssl)"
```

**Ensure MySQL is NOT running as a service:**
```bash
brew services stop mysql@8.0
```

We don't want the local MySQL running—Docker will handle that.

**Verify Installation:**
```bash
mysql --version
# Should output: mysql  Ver 8.0.x
```

---

### Step 7: Install Image Processing Libraries

Gumroad uses ImageMagick and libvips for image processing.

**Install ImageMagick:**
```bash
brew install imagemagick
```

**Install libvips:**
```bash
brew install libvips
```

**Verify Installation:**
```bash
convert -version
# Should show ImageMagick version

vips --version
# Should show libvips version
```

---

### Step 8: Install FFmpeg

FFmpeg is used for video file metadata extraction.

**Install FFmpeg:**
```bash
brew install ffmpeg
```

**Verify Installation:**
```bash
ffmpeg -version
# Should show FFmpeg version

ffprobe -version
# Should show ffprobe version
```

---

### Step 9: Install PDFtk

PDFtk is used for PDF stamping (watermarking PDFs with buyer email).

**Download PDFtk for macOS:**
1. Visit [https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/pdftk_server-2.02-mac_osx-10.11-setup.pkg](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/pdftk_server-2.02-mac_osx-10.11-setup.pkg)
2. Download the `.pkg` file
3. Double-click to install

**Note:** macOS may block the installer with a security warning.

**To allow PDFtk installation:**
1. Go to **System Settings → Privacy & Security**
2. Scroll to the bottom of the "Security" section
3. Click **"Open Anyway"** next to the PDFtk message
4. Run the installer again

**Verify Installation:**
```bash
pdftk --version
# Should show PDFtk version
```

---

### Step 10: Install wkhtmltopdf

wkhtmltopdf converts HTML to PDF for invoice generation.

**Download wkhtmltopdf 0.12.6:**
1. Visit [https://wkhtmltopdf.org/downloads.html](https://wkhtmltopdf.org/downloads.html)
2. Download the macOS installer (0.12.6)
3. Double-click to install

**Note:** Like PDFtk, this may also be blocked by macOS.

**To allow wkhtmltopdf installation:**
1. Go to **System Settings → Privacy & Security**
2. Click **"Open Anyway"**
3. Run the installer again

**Verify Installation:**
```bash
wkhtmltopdf --version
# Should show wkhtmltopdf version 0.12.6
```

---

### Step 11: Install mkcert (for local SSL)

mkcert creates locally-trusted SSL certificates for `https://gumroad.dev`.

**Install mkcert:**
```bash
brew install mkcert
```

**Install local CA:**
```bash
mkcert -install
```

**Verify Installation:**
```bash
mkcert -CAROOT
# Should output path to CA root
```

---

### Step 12: Clone the Gumroad Repository

**Clone the repository:**
```bash
git clone https://github.com/antiwork/gumroad.git
cd gumroad
```

---

### Step 13: Install Ruby Dependencies

**Install gems:**
```bash
bundle install
```

This will take 5-10 minutes to install all Ruby gems.

**Common Issues:**

If you encounter errors with `mysql2`:
```bash
bundle config --global build.mysql2 --with-opt-dir="$(brew --prefix openssl)"
bundle install
```

If you encounter errors with `eventmachine`:
```bash
bundle config --global build.eventmachine --with-cppflags=-I$(brew --prefix openssl)/include
bundle install
```

---

### Step 14: Install Node.js Dependencies

**Install npm packages:**
```bash
npm install
```

This will take 3-5 minutes to install all Node.js packages.

---

## Configuration

### Step 15: Generate SSL Certificates

Generate local SSL certificates for `https://gumroad.dev`:

```bash
bin/generate_ssl_certificates
```

This creates certificates in `config/ssl/`.

---

### Step 16: Set Up Environment Variables (Optional)

The app can run without custom credentials, but if you want to test integrations (S3, Stripe, etc.), set up environment variables.

**Copy the example file:**
```bash
cp .env.example .env
```

**Edit `.env`** and add your credentials:
```bash
# AWS (for S3 file storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_DEFAULT_REGION=us-east-1

# Stripe (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Resend (for emails)
RESEND_API_KEY=re_...
```

**Note:** These are optional for local development. The app will work without them.

---

### Step 17: Create S3 Buckets (Optional)

If you're using AWS S3 for file storage, create the required buckets:

**Using AWS CLI:**
```bash
aws s3 mb s3://gumroad_dev
aws s3 mb s3://gumroad-dev-public-storage
```

**Or via AWS Console:**
1. Go to [S3 Console](https://console.aws.amazon.com/s3/)
2. Create bucket: `gumroad_dev`
3. Create bucket: `gumroad-dev-public-storage`

---

### Step 18: Configure /etc/hosts

Add `gumroad.dev` to your hosts file:

```bash
sudo sh -c 'echo "127.0.0.1 gumroad.dev" >> /etc/hosts'
```

**Verify:**
```bash
ping gumroad.dev
# Should resolve to 127.0.0.1
```

---

## Running the Application

### Step 19: Start Docker Services

Docker runs MySQL, Redis, Elasticsearch, MongoDB, and Nginx.

**Start Docker services:**
```bash
make local
```

**Note:** This command will not terminate. Keep this terminal tab open.

**Alternative (run in background):**
```bash
LOCAL_DETACHED=true make local
```

**Wait for services to be ready** (30-60 seconds).

**Verify services are running:**
```bash
docker ps
```

You should see containers for:
- `mysql`
- `redis`
- `elasticsearch`
- `mongo`
- `nginx`

---

### Step 20: Set Up the Database

In a new terminal tab:

```bash
cd gumroad
bin/rails db:prepare
```

This will:
- Create the database
- Run migrations
- Load schema
- Seed initial data

**Expected output:**
```
Database created
Schema loaded
Seed data loaded
```

---

### Step 21: Index Elasticsearch

Populate Elasticsearch indices to avoid errors:

**Start Rails console:**
```bash
bin/rails console
```

**Run indexing command:**
```ruby
DevTools.delete_all_indices_and_reindex_all
```

Wait for completion (1-2 minutes), then exit:
```ruby
exit
```

---

### Step 22: Start the Development Server

**Start Rails server, Webpack, and Sidekiq:**
```bash
bin/dev
```

This starts three processes:
1. **Rails server** (Puma) on port 3000
2. **Webpack dev server** on port 3035
3. **Sidekiq worker** for background jobs

**Expected output:**
```
rails: Puma starting in development
webpack: webpack compiled successfully
worker: Sidekiq starting
```

---

### Step 23: Access the Application

**Open your browser and visit:**
```
https://gumroad.dev
```

**Note:** Use `https://`, not `http://`.

You should see the Gumroad homepage!

---

## Verification & Testing

### Step 24: Log In

**Default credentials:**
- **Email:** `seller@gumroad.com`
- **Password:** `password`
- **2FA Code:** `000000`

**Log in steps:**
1. Go to `https://gumroad.dev`
2. Click "Log in"
3. Enter email and password
4. Enter 2FA code: `000000`

You should now be logged in to the dashboard!

---

### Step 25: Run Tests

**Run the full test suite:**
```bash
bin/rspec
```

**Run a specific test file:**
```bash
bin/rspec spec/models/user_spec.rb
```

**Run a specific test:**
```bash
bin/rspec spec/models/user_spec.rb:15
```

**Common Issues:**

**macOS fork() error:**
If you see fork-related errors on macOS:
```bash
export DISABLE_SPRING=1
bin/rspec spec/models/user_spec.rb
```

---

### Step 26: Check Background Jobs

**Start Sidekiq** (if not already running via `bin/dev`):
```bash
bundle exec sidekiq
```

**Verify Sidekiq is processing jobs:**
1. Visit `https://gumroad.dev/sidekiq`
2. You should see the Sidekiq dashboard
3. Check for queues: `critical`, `default`, `low`

---

## Common Issues & Troubleshooting

### Issue 1: Docker Services Won't Start

**Symptoms:**
- `make local` fails
- "Port already in use" errors

**Solutions:**

**Check if ports are already in use:**
```bash
lsof -i :80
lsof -i :443
lsof -i :3306
lsof -i :6379
lsof -i :9200
lsof -i :27017
```

**Stop conflicting services:**
```bash
brew services stop mysql
brew services stop redis
```

**Restart Docker Desktop:**
1. Quit Docker Desktop
2. Relaunch from Applications

**Try again:**
```bash
make local
```

---

### Issue 2: MySQL Connection Errors

**Symptoms:**
- "Can't connect to MySQL server"
- `bin/rails db:prepare` fails

**Solutions:**

**Ensure Docker MySQL is running:**
```bash
docker ps | grep mysql
```

**Restart Docker services:**
```bash
docker-compose -f docker-compose-local.yml down
make local
```

**Check database credentials:**
```yaml
# config/database.yml
development:
  host: 127.0.0.1
  port: 3306
  username: root
  password: password
```

---

### Issue 3: Elasticsearch Errors

**Symptoms:**
- "index_not_found_exception"
- Search doesn't work

**Solution:**

**Reindex Elasticsearch:**
```bash
bin/rails console
```

```ruby
DevTools.delete_all_indices_and_reindex_all
```

---

### Issue 4: Bundle Install Fails (mysql2 gem)

**Symptoms:**
- "mysql2 failed to build"
- OpenSSL errors

**Solution:**

**Configure bundle with OpenSSL path:**
```bash
bundle config --global build.mysql2 --with-opt-dir="$(brew --prefix openssl)"
bundle install
```

**Reinstall OpenSSL if needed:**
```bash
brew reinstall openssl
```

---

### Issue 5: SSL Certificate Errors

**Symptoms:**
- "Your connection is not private" in browser
- Certificate warnings

**Solution:**

**Regenerate certificates:**
```bash
bin/generate_ssl_certificates
```

**Reinstall mkcert CA:**
```bash
mkcert -uninstall
mkcert -install
bin/generate_ssl_certificates
```

**Restart your browser** after regenerating certificates.

---

### Issue 6: Webpack Compilation Errors

**Symptoms:**
- "Module not found" errors
- JavaScript doesn't update

**Solutions:**

**Clear npm cache:**
```bash
rm -rf node_modules
npm install
```

**Restart Webpack dev server:**
```bash
# Stop bin/dev (Ctrl+C)
bin/dev
```

**Check for TypeScript errors:**
```bash
npm run type-check
```

---

### Issue 7: Port 80/443 Permission Denied

**Symptoms:**
- "Permission denied" when running `make local`
- Nginx won't start

**Solution:**

**Run with sudo** (Linux/Docker installed via package manager):
```bash
sudo make local
```

**Or use Docker Desktop** (recommended for macOS):
- Ensure you have Docker Desktop installed
- Don't use Docker from Homebrew

---

### Issue 8: Sidekiq Jobs Not Processing

**Symptoms:**
- Background jobs stuck in queue
- Emails not sending

**Solutions:**

**Check if Sidekiq is running:**
```bash
ps aux | grep sidekiq
```

**Start Sidekiq manually:**
```bash
bundle exec sidekiq
```

**Check Redis connection:**
```bash
redis-cli ping
# Should return: PONG
```

**Restart Redis:**
```bash
docker restart gumroad_redis
```

---

### Issue 9: Tests Failing with fork() Error

**Symptoms:**
```
objc[xxxxx]: +[__NSCFConstantString initialize] may have been in progress in another thread when fork() was called.
```

**Solution:**

**Disable Spring before running tests:**
```bash
export DISABLE_SPRING=1
bin/rspec
```

**Or stop Spring:**
```bash
bin/spring stop
bin/rspec
```

---

### Issue 10: Elasticsearch Not Starting

**Symptoms:**
- Docker shows Elasticsearch container exiting
- Search features not working

**Solutions:**

**Check Docker logs:**
```bash
docker logs gumroad_elasticsearch
```

**Increase Docker memory:**
1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to 8GB or more
4. Apply & Restart

**Restart Elasticsearch container:**
```bash
docker restart gumroad_elasticsearch
```

---

## Development Workflow

### Daily Workflow

**1. Start Docker services** (if not running):
```bash
make local
```

**2. Start development server:**
```bash
bin/dev
```

**3. Access application:**
```
https://gumroad.dev
```

**4. Make changes** to code

**5. Run tests:**
```bash
bin/rspec spec/models/your_model_spec.rb
```

**6. Commit changes:**
```bash
git add .
git commit -m "feat(feature): Add new feature"
```

---

### Common Development Commands

**Rails Console:**
```bash
bin/rails console
```

**Database Operations:**
```bash
bin/rails db:migrate           # Run migrations
bin/rails db:rollback          # Rollback last migration
bin/rails db:seed              # Seed data
bin/rails db:reset             # Drop, create, migrate, seed
```

**Asset Compilation:**
```bash
npm run build                  # Production build
npm run watch                  # Watch mode
npm run analyze                # Bundle analysis
```

**Testing:**
```bash
bin/rspec                      # All tests
bin/rspec spec/models          # Model tests only
bin/rspec spec/requests        # Integration tests
```

**Linting:**
```bash
bundle exec rubocop            # Ruby linting
bundle exec rubocop -a         # Auto-fix Ruby issues
npm run lint-fast              # JavaScript linting
```

**Background Jobs:**
```bash
bundle exec sidekiq            # Start Sidekiq worker
```

**Docker:**
```bash
docker ps                      # List running containers
docker logs gumroad_mysql      # View MySQL logs
docker restart gumroad_redis   # Restart Redis
docker-compose down            # Stop all services
```

---

### Git Hooks (Optional)

Enable local git hooks for linting on commit:

```bash
git config --local core.hooksPath .githooks
```

This will run Rubocop and ESLint before each commit.

---

### Preview Emails Locally

You can preview email templates without sending:

**Visit:**
```
https://gumroad.dev/rails/mailers
```

You'll see all mailer previews with example data.

---

### Custom Domains (Testing)

To test custom domain functionality:

**1. Add entry to `/etc/hosts`:**
```bash
sudo sh -c 'echo "127.0.0.1 sample-custom-domain.example.com" >> /etc/hosts'
```

**2. Configure custom domain:**
1. Visit `https://gumroad.dev/settings/advanced`
2. Add `sample-custom-domain.example.com`

**3. Modify constraint** (temporary):
Edit `lib/gumroad_domain_constraint.rb` line 5 and remove `Rails.env.development? ||`

**4. Restart server and visit:**
```
http://sample-custom-domain.example.com:3000
```

---

## Useful Commands

### Database

```bash
# Create database
bin/rails db:create

# Run migrations
bin/rails db:migrate

# Rollback migration
bin/rails db:rollback

# Reset database (drop, create, migrate, seed)
bin/rails db:reset

# Open MySQL console
mysql -h 127.0.0.1 -u root -ppassword gumroad_development
```

---

### Rails Console

```bash
# Open console
bin/rails console

# Run console in sandbox mode (rollback all changes on exit)
bin/rails console --sandbox
```

**Useful console commands:**
```ruby
# Find user
User.find_by(email: 'seller@gumroad.com')

# Create product
Product.create!(name: 'Test Product', price_cents: 1000, creator_id: 1)

# Process subscription
sub = Subscription.last
sub.charge!

# Reindex Elasticsearch
DevTools.delete_all_indices_and_reindex_all
```

---

### Testing

```bash
# Run all tests
bin/rspec

# Run specific test file
bin/rspec spec/models/user_spec.rb

# Run specific test by line number
bin/rspec spec/models/user_spec.rb:15

# Run tests with coverage
COVERAGE=true bin/rspec

# Run tests multiple times (check for flakiness)
for i in {1..10}; do
  echo "Run number $i"
  bin/rspec spec/requests/product_creation_spec.rb:28
done
```

---

### Debugging

```bash
# View Rails logs
tail -f log/development.log

# View Sidekiq logs
tail -f log/sidekiq.log

# View Docker container logs
docker logs -f gumroad_mysql
docker logs -f gumroad_redis
docker logs -f gumroad_elasticsearch
```

---

### Performance Profiling

```bash
# Start Rails with profiling
RACK_PROFILER=true bin/rails server

# Visit any page and add ?pp=enable to the URL
https://gumroad.dev/products?pp=enable
```

---

## Next Steps

### Learn the Codebase

1. **Read Architecture Guide:** `ARCHITECTURE.md`
2. **Explore Code Structure:** Start with `app/models/` and `app/controllers/`
3. **Review Tests:** Check `spec/` for examples

### Make Your First Contribution

1. **Find an issue:** Look for "good first issue" labels
2. **Create a branch:** `git checkout -b feature/my-feature`
3. **Make changes:** Edit code and add tests
4. **Run tests:** `bin/rspec`
5. **Create PR:** Push and open pull request

### Join the Community

- **GitHub Issues:** [https://github.com/antiwork/gumroad/issues](https://github.com/antiwork/gumroad/issues)
- **Discussions:** [https://github.com/antiwork/gumroad/discussions](https://github.com/antiwork/gumroad/discussions)
- **Contributing Guide:** Read `CONTRIBUTING.md`

---

## Additional Resources

### Documentation

- `README.md` - Quick start guide
- `ARCHITECTURE.md` - Complete architecture overview
- `CONTRIBUTING.md` - Contribution guidelines
- `docs/testing.md` - Testing best practices
- `docs/taxes.md` - Tax calculation details
- `docs/shipping.md` - Shipping integration
- `docs/paypal.md` - PayPal setup

### External Resources

- [Ruby on Rails Guides](https://guides.rubyonrails.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [RSpec Documentation](https://rspec.info/)

---

## Summary

You now have a fully functional Gumroad development environment on your M3 Mac! 🎉

**What you've set up:**
- ✅ Ruby 3.4.3 with Rails 7.1
- ✅ Node.js 20.17.0 with npm
- ✅ Docker with MySQL, Redis, Elasticsearch, MongoDB
- ✅ All required tools (ImageMagick, FFmpeg, PDFtk, wkhtmltopdf)
- ✅ SSL certificates for local HTTPS
- ✅ Complete Gumroad application running locally

**Quick Start Commands:**
```bash
# Start services
make local

# Start app (in new terminal)
bin/dev

# Access app
open https://gumroad.dev

# Log in
# Email: seller@gumroad.com
# Password: password
# 2FA: 000000
```

**Need Help?**
- Check the troubleshooting section above
- Read the documentation in `docs/`
- Open an issue on GitHub
- Join discussions

**Happy coding!** 🚀
