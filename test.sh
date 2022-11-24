### 
set -e

echo "脚本执行"

# 提交代码
git init
git add -A
git commit -m 'deploy'
git push origin https://github.com/JevenPlus/vuepress-starter.git

# 生成静态文件
npm run build:docs

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/JevenPlus/vuepress-starter.git main:gh-pages

cd -